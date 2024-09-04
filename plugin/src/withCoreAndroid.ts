import { withMainApplication, ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';
import { SdkConfigurationProps } from './types';

// const androidSdkBom = "com.adobe.marketing.mobile:sdk-bom:3.+";
const fs = require('fs');
const path = require('path');

//-- to do these imports  are  also present in the documentaion  . Are we adding support in the coming future or what?
// https://github.com/adobe/aepsdk-react-native#requirements
// import com.adobe.marketing.mobile.AdobeCallback;
//import com.adobe.marketing.mobile.Extension;

// map of aep's react native sdk's and their android counterparts
const androidSdkExtensionMap: Record<string, string> = {
  '@adobe/react-native-aepuserprofile': 'UserProfile',
  '@adobe/react-native-aepedge': 'Edge',
  '@adobe/react-native-aepassurance': 'Assurance',
  '@adobe/react-native-aepedgeidentity': 'Identity',
  '@adobe/react-native-aepedgeconsent': 'Consent',
  '@adobe/react-native-aepedgebridge': 'EdgeBridge',
  '@adobe/react-native-aepmessaging': 'Messaging',
  '@adobe/react-native-aepoptimize': 'Optimize',
  '@adobe/react-native-aepplaces': 'Places',
  '@adobe/react-native-aeptarget': 'Target',
  '@adobe/react-native-aepcampaignclassic': 'CampaignClassic',
};

const androidSdkImportMap: Record<string, string> = {
  '@adobe/react-native-aepcore': 'import com.adobe.marketing.mobile.MobileCore',
  '@adobe/react-native-aepuserprofile': 'import com.adobe.marketing.mobile.UserProfile',
  '@adobe/react-native-aepedge': 'import com.adobe.marketing.mobile.Edge',
  '@adobe/react-native-aepassurance': 'import com.adobe.marketing.mobile.Assurance',
  '@adobe/react-native-aepedgeidentity': 'import com.adobe.marketing.mobile.edge.identity.Identity',
  '@adobe/react-native-aepedgeconsent': 'import com.adobe.marketing.mobile.edge.consent.Consent',
  '@adobe/react-native-aepedgebridge': 'import com.adobe.marketing.mobile.edge.bridge.EdgeBridge',
  '@adobe/react-native-aepmessaging': 'import com.adobe.marketing.mobile.Messaging',
  '@adobe/react-native-aepoptimize': 'import com.adobe.marketing.mobile.Optimize',
  '@adobe/react-native-aepplaces': 'import com.adobe.marketing.mobile.Places',
  '@adobe/react-native-aeptarget': 'import com.adobe.marketing.mobile.Target',
  '@adobe/react-native-aepcampaignclassic': 'import com.adobe.marketing.mobile.CampaignClassic',
};
const withCoreMainApplication: ConfigPlugin<SdkConfigurationProps> = (
  config,
  { logLevel, environmentFileId }
) => {
  // Modify the mainApplication file here to include the SDK initialization in the onCreate function

  return withMainApplication(config, (config) => {
    let mainApplication = config.modResults.contents;

    const sdkInit = `
      MobileCore.setApplication(this);
      MobileCore.configureWithAppID("${environmentFileId}");
      MobileCore.setLogLevel(LoggingMode.${logLevel});
    `;

    // Read the application dependencies from package.json and add the imports to MainApplication.kt
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies;

    let importsToAdd = [
      'import com.adobe.marketing.mobile.Lifecycle',
      'import com.adobe.marketing.mobile.Signal',
      'import android.util.Log',
      'import com.adobe.marketing.mobile.LoggingMode',
    ];
    let extensions = `Lifecycle.EXTENSION, Signal.EXTENSION`;

    // Iterate over the dependencies and add the imports to the mainApplication file
    for (const [name] of Object.entries(dependencies)) {
      if (name === '@adobe/react-native-aepcore') {
        continue;
      }

      if (androidSdkImportMap[name]) {
        importsToAdd.push(androidSdkImportMap[name]);
      }
      // Also update extensions list with the extension for the SDK sometimes  androidSdkImportMap does not have that named import therefore making it separate
      if (androidSdkExtensionMap[name]) {
        extensions += `, ${androidSdkExtensionMap[name]}.EXTENSION`;
      }
    }
    if (!importsToAdd.includes('import com.adobe.marketing.mobile.MobileCore')) {
      importsToAdd.push('import com.adobe.marketing.mobile.MobileCore');
    }

    //will cater the case of different sequence of imports
    const importsWithComments = `// Adobe SDKs imports start\n${importsToAdd.join(
      '\n'
    )}\n// Adobe SDKs imports end`;
    // Regex to find the block between the Adobe SDKs imports start and end comments
    const adobeImportsBlockRegex =
      /(\/\/ Adobe SDKs imports start[\s\S]*?\/\/ Adobe SDKs imports end)/;

    // Check if the block exists
    if (adobeImportsBlockRegex.test(mainApplication)) {
      // If the block exists, replace it with the new imports and comments
      mainApplication = mainApplication.replace(adobeImportsBlockRegex, importsWithComments);
    } else {
      // If the block is not found, check for the imports between Lifecycle and MobileCore
      const lifecycleToIdentityRegex =
        /(import\s+com\.adobe\.marketing\.mobile\.Lifecycle[\s\S]*?import\s+com\.adobe\.marketing\.mobile\.MobileCore)/;

      if (lifecycleToIdentityRegex.test(mainApplication)) {
        // If found, replace the block between Lifecycle and Identity with the new imports and comments
        mainApplication = mainApplication.replace(lifecycleToIdentityRegex, importsWithComments);
      } else {
        // If neither block is found, add the imports with comments after the package declaration
        mainApplication = mainApplication.replace(
          /(package\s+com\..*?)(\s|$)/,
          `$1;\n\n${importsWithComments}\n\n`
        );
      }
    }

    const extensionCode = `val extensions = listOf(${extensions})`;
    const registerExtensions = `
      ${extensionCode}
      MobileCore.registerExtensions(extensions) {
        // Use the extensions in your app
        Log.d("CoreExtensions", "Extensions registered successfully");
      }
    `;
    // Define the new code to be inserted
    const newCodeBlock = ` ${sdkInit}\n        ${registerExtensions}`;

    // Define the regex to find the specific block of code to replace
    const codeBlockRegex =
      /MobileCore\.setApplication\(this\);[\s\S]*?Log\.d\("CoreExtensions",\s*"Extensions registered successfully"\);[\s\S]*?\}/;

    // Check if the specific block of code exists
    if (codeBlockRegex.test(mainApplication)) {
      // If the block exists, replace it with the new code block
      mainApplication = mainApplication.replace(codeBlockRegex, newCodeBlock);
    } else {
      // If the block is not found, insert the new code block after super.onCreate()
      mainApplication = mainApplication.replace(
        /super\.onCreate\(\)/,
        `super.onCreate()\n        ${newCodeBlock}`
      );
    }

    config.modResults.contents = mainApplication;

    return config;
  });
};

export const withCoreAndroidSdk: ConfigPlugin<SdkConfigurationProps> = (config, props) => {
  config = withCoreMainApplication(config, props);

  return config;
};
