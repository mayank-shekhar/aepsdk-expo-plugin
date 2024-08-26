import { withMainApplication, ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';
import { SdkConfigurationProps } from './types';

// const androidSdkBom = "com.adobe.marketing.mobile:sdk-bom:3.+";
const fs = require("fs");
const path = require("path");

// map of aep's react native sdk's and their android counterparts
const androidSdkExtensionMap: Record<string, string> = {
  '@adobe/react-native-aepcore': 'Core',
  '@adobe/react-native-aepuserprofile': 'UserProfile',
  '@adobe/react-native-aepedge': 'Edge',
  '@adobe/react-native-aepassurance': 'Assurance',
  '@adobe/react-native-aepedgeidentity': 'EdgeIdentity',
  '@adobe/react-native-aepedgeconsent': 'EdgeConsent',
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
  '@adobe/react-native-aepedgeidentity': 'import com.adobe.marketing.mobile.EdgeIdentity',
  '@adobe/react-native-aepedgeconsent': 'import com.adobe.marketing.mobile.EdgeConsent',
  '@adobe/react-native-aepedgebridge': 'import com.adobe.marketing.mobile.EdgeBridge',
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
  // modify the mainApplication file her to include the SDK initialization in the onCreate func
  return withMainApplication(config, (config) => {
    let mainApplication = config.modResults.contents;

    const sdkInit = `
      MobileCore.setApplication(this);
      MobileCore.configureWithAppID("${environmentFileId}");
      MobileCore.setLogLevel(LoggingMode.${logLevel});
    `;


    // Read the application dependencies from package.json and add them imports to MainApplication.kt
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs
      .readFileSync(packageJsonPath, "utf8")
    );
    const dependencies = packageJson.dependencies;

    let importsToAdd = [];

    // create an extensions list with Lifecycle, Signal, and Identity
    let extensions = `Lifecycle.EXTENSION(), Signal.EXTENSION(), Identity.EXTENSION()`;

    // iterate over the dependencies and add the imports to the mainApplication file
    for (const [name] of Object.entries(dependencies)) {
      if (androidSdkImportMap[name]) {
        importsToAdd.push(androidSdkImportMap[ name ]);

        // also update extensions list with the extension for the sdk
        extensions = extensions + `, ${androidSdkExtensionMap[ name ]}.EXTENSION()`;
      }

      if (name === "@adobe/react-native-aepcore") {
        importsToAdd.push("import com.adobe.marketing.mobile.LifeCycle");
        importsToAdd.push("import com.adobe.marketing.mobile.Signal");
        importsToAdd.push("import com.adobe.marketing.mobile.Identity");
      }
    }

    // Add the import statements to the mainApplication file at the top
    mainApplication = mainApplication.replace(
      /package com.*;/,
      `${importsToAdd.join("\n")}\n\npackage com.*;`
    );

    const extensionCode = `val extensions = listOf(${ extensions })`;

    // Register Extensions with MobileCore
    const registerExtensions = `
      ${extensionCode}
      MobileCore.registerExtensions(extensions) {
        // Use the extensions in your app
        Log.d("CoreExtensions", "Extensions registered successfully");
      }
    `;

    // insert all the code from above after super.onCreate();
    mainApplication = mainApplication.replace(
      /super.onCreate\(\);/,
      `super.onCreate();\n        ${sdkInit}\n        ${registerExtensions}`
    );



    return config;
  });
};

export const withCoreAndroidSdk: ConfigPlugin<SdkConfigurationProps> = (config, props) => {
  config = withCoreMainApplication(config, props);

  return config;
};
