import { withMainApplication, ConfigPlugin } from '@expo/config-plugins';
import { SdkConfigurationProps } from './types';

// map of aep's react native sdk's and their android counterparts
const androidSdkMap: Record<string, string> = {
  '@adobe/react-native-aepcore': 'AEPCore',
  '@adobe/react-native-userprofile': 'AEPUserProfile',
  '@adobe/react-native-aepedge': 'AEPEdge',
  '@adobe/react-native-aepassurance': 'AEPAssurance',
  '@adobe/react-native-aepedgeidentity': 'AEPEdgeIdentity',
  '@adobe/react-native-aepedgeconsent': 'AEPEdgeConsent',
  '@adobe/react-native-aepedgebridge': 'AEPEdgeBridge',
  '@adobe/react-native-aepmessaging': 'AEPMessaging',
  '@adobe/react-native-aepoptimize': 'AEPOptimize',
  '@adobe/react-native-aepplaces': 'AEPPlaces',
  '@adobe/react-native-aeptarget': 'AEPTarget',
  '@adobe/react-native-aepcampaignclassic': 'AEPCampaignClassic',
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

    // Add extensions code from https://github.com/adobe/aepsdk-core-android/blob/main/Documentation/MobileCore/getting-started.md#kotlin-1
    // to the mainApplication file
    const extensions = `
            // Register the extensions with MobileCore
            val extensions = listOf(
                Identity.EXTENSION();
                Lifecycle.EXTENSION();
                Signal.EXTENSION();
                UserProfile.EXTENSION();
            )
            MobileCore.registerExtensions(extensions) {
                // Use the extensions in your app
                Log.d("CoreExtensions", "Extensions registered successfully");
            }
        `;

    // Insert the SDK initialization code into the onCreate function in kotlin
    const onCreateFunc = `override fun onCreate() {
            super.onCreate();
            ${sdkInit}
            ${extensions}
        }`;

    // modify the onCreate function to include the SDK initialization
    mainApplication = mainApplication.replace(/override fun onCreate\(\) {/, onCreateFunc);

    // Add the import statements
    const imports = `import com.adobe.marketing.mobile.MobileCore;
        import com.adobe.marketing.mobile.LoggingMode;
        import com.adobe.marketing.mobile.Identity;
        import com.adobe.marketing.mobile.Lifecycle;
        import com.adobe.marketing.mobile.Signal;
        import com.adobe.marketing.mobile.UserProfile;`;

    // Add the imports to the mainApplication file
    mainApplication = mainApplication.replace(
      /import android.app.Application;/,
      `${imports}\nimport android.app.Application;`
    );

    return config;
  });
};

export const withCoreAndroidSdk: ConfigPlugin<SdkConfigurationProps> = (config, props) => {
  config = withCoreMainApplication(config, props);
  //   config = withCoreXcodeProject(config, props);

  return config;
};
