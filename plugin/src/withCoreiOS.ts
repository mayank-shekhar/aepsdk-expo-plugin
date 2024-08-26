import { ConfigPlugin, withInfoPlist, withPodfile, withXcodeProject, withAppDelegate } from "@expo/config-plugins";
import { SdkConfigurationProps } from "./types";

const fs = require("fs");
const path = require("path");

// map of aep's react native sdk's and their ios counterparts
const iosSdkMap: Record<string, string> = {
  "@adobe/react-native-aepcore": "AEPCore",
  "@adobe/react-native-aepuserprofile": "AEPUserProfile",
  "@adobe/react-native-aepedge": "AEPEdge",
  "@adobe/react-native-aepassurance": "AEPAssurance",
  "@adobe/react-native-aepedgeidentity": "AEPEdgeIdentity",
  "@adobe/react-native-aepedgeconsent": "AEPEdgeConsent",
  "@adobe/react-native-aepedgebridge": "AEPEdgeBridge",
  "@adobe/react-native-aepmessaging": "AEPMessaging",
  "@adobe/react-native-aepoptimize": "AEPOptimize",
  "@adobe/react-native-aepplaces": "AEPPlaces",
  "@adobe/react-native-aeptarget": "AEPTarget",
  "@adobe/react-native-aepcampaignclassic": "AEPCampaignClassic",
};

const iosSdkClassMap: Record<string, string> = {
  "@adobe/react-native-aepcore": "MobileCore",
  "@adobe/react-native-aepuserprofile": "UserProfile",
  "@adobe/react-native-aepedge": "Edge",
  "@adobe/react-native-aepassurance": "Assurance",
  "@adobe/react-native-aepedgeidentity": "EdgeIdentity",
  "@adobe/react-native-aepedgeconsent": "EdgeConsent",
  "@adobe/react-native-aepedgebridge": "EdgeBridge",
  "@adobe/react-native-aepmessaging": "Messaging",
  "@adobe/react-native-aepoptimize": "Optimize",
  "@adobe/react-native-aepplaces": "Places",
  "@adobe/react-native-aeptarget": "Target",
  "@adobe/react-native-aepcampaignclassic": "CampaignClassic",
};

const withCoreInfoPlist: ConfigPlugin<SdkConfigurationProps> = (
  config,
  { logLevel, environmentFileId },
) => {
  return withInfoPlist(config, (config) => {
    delete config.modResults.AEPSDK;
    if (environmentFileId) {
      config.modResults.AEPSDK = {
        environmentFileId,
      };
    }

    if (logLevel) {
      config.modResults.AEPSDK = {
        ...config.modResults.AEPSDK,
        logLevel,
      };
    }
    return config;
  });
};

const withCorePodfile: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  return withPodfile(config, (config) => {
    const podFile = config.modResults;
    const codeToAdd = `
      # Added by Adobe Expo SDK Plugin
      installer.pods_project.targets.each do |t|
          if t.name.start_with?("AEP")
            t.build_configurations.each do |bc|
                bc.build_settings['OTHER_SWIFT_FLAGS'] = '$(inherited) -no-verify-emitted-module-interface'
            end
          end
      end
    `;

    if (podFile.contents.includes(codeToAdd)) {
      return config;
    } else {
      podFile.contents = podFile.contents.replace(
        "post_install do |installer|",
        `post_install do |installer| ${codeToAdd}`,
      );
    }
    return config;
  });
};

const withCoreXcodeProject: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  return withXcodeProject(config, (config) => {

    // Get the pbxproj file
    const pbxproj = config.modResults;

    let configurations = pbxproj.pbxXCBuildConfigurationSection(),
        INHERITED = '"$(inherited)"',
      buildSettings;

    for (let config in configurations) {
      buildSettings = configurations[ config ].buildSettings;

      if (!buildSettings) {
        continue;
      } else {
        console.log(
          'buildSettings', buildSettings
        )

        // Modify the build settings to add -fcxx-modules flag in the Other C Flags
        if (!buildSettings['OTHER_CPLUSPLUSFLAGS']
            || buildSettings['OTHER_CPLUSPLUSFLAGS'] === INHERITED) {
          buildSettings[ 'OTHER_CPLUSPLUSFLAGS' ] = [ INHERITED ];

          // Add -fcxx-modules flag to the Other C Flags
          buildSettings[ 'OTHER_CPLUSPLUSFLAGS' ].push("-fcxx-modules");
        }

      }
    }
    config.modResults = pbxproj;

    return config
  });
};

export const withCoreAppDelegate: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  return withAppDelegate(config, (config) => {
    const { logLevel} = props;
    let appDelegate = config.modResults.contents;


    // set the log level based on props.logLevel
    let logLevelCode = `  MobileCore.setLogLevel(.${props.logLevel});`;
    if (logLevel == "DEBUG") {
      logLevelCode = `  MobileCore.setLogLevel(.debug)`
    } else if (logLevel == "ERROR") {
      logLevelCode = `  MobileCore.setLogLevel(.error)`
    } else if (logLevel == "WARNING") {
      logLevelCode = `  MobileCore.setLogLevel(.warning)`
    } else if (logLevel == "VERBOSE" || logLevel == "INFO") {
      logLevelCode = `  MobileCore.setLogLevel(.trace)`
    } else {
      logLevelCode = `  MobileCore.setLogLevel(.error)`
    }

    // Read the application dependencies from package.json and add the imports in AppDelegate.m
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs
      .readFileSync(packageJsonPath, "utf8")
    );

    const dependencies = packageJson.dependencies;

    let extensions = `Identity.self, Lifecycle.self, Signal.self`;

    const importsToAdd = ['@import AEPCore', '@import AEPLifecycle', '@import AEPSignal', '@import AEPIdentity'];
    for (const [name] of Object.entries(dependencies)) {
      if (name.startsWith("@adobe/react-native-aepcore")) {
        continue;
      } else {
        // check if name is in the iosSdkMap
        if (iosSdkMap[ name ]) {
          importsToAdd.push(`@import ${iosSdkMap[ name ]}`);
          extensions = extensions + `, ${iosSdkClassMap[ name ]}.self`;
        }
      }
    }

    // check if importToAdd is empty, means RN SDKs are not installed in the project, raise an error
    if (importsToAdd.length === 0) {
      throw new Error("No SDKs found in package.json. Please add the SDKs to the project.")
    } else {
      importsToAdd.push('@import AEPServices')
    }

    // Add AEP SDK import code in app delegate file
    const importCode = importsToAdd.join("\n");

    // check if import code is already added then remove it and add updated code
    if (appDelegate.includes("@import AEPCore")) {
      appDelegate = appDelegate.replace(
        /@import AEPCore[\s\S]*@import AEPServices/,
        importCode
      );
    } else {
      // Add the import statements to the app delegate file at the top
      appDelegate = appDelegate.replace(
        /#import "AppDelegate.h"/,
        `#import "AppDelegate.h"\n//Added by Adobe Expo SDK Plugin\n${importCode}`
      );
    }

    // Add the SDK initialization code in the didFinishLaunchingWithOptions function
    const sdkInit = `
  // Added by Adobe Expo SDK Plugin
  MobileCore.registerExtensions([${extensions}]) {
    // Use the extensions in your app
    MobileCore.registerWith(appId: "${props.environmentFileId}")
    print("Extensions registered successfully")

    if application.applicationState != .background {
      // Only start lifecycle if the application is not in the background
      MobileCore.lifecycleStart(additionalContextData: ["contextDataKey": "contextDataVal"])
    }
  }
    `;

    // Add the SDK Initialization code to the didFinishLaunchingWithOptions function after "self.initialProps = @{};"
    // check if code is already added
    if (appDelegate.includes(sdkInit)) {
      // remove the existing code and add the updated code
      appDelegate = appDelegate.replace(
        /.*MobileCore.registerExtensions\(\[.*\]\) {/,
        sdkInit
      );
    } else {
      // add the code to the didFinishLaunchingWithOptions function
      appDelegate = appDelegate.replace(
        /self.initialProps = @{};/,
        `self.initialProps = @{};\n${logLevelCode}\n${sdkInit}`
      );
    }

    console.log('appDelegate', appDelegate);
    config.modResults.contents = appDelegate;

    return config

  });



}

export const withCoreiOSSdk: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  config = withCorePodfile(config, props);
  config = withCoreXcodeProject(config, props);
  // config = withCoreInfoPlist(config, props);
  config = withCoreAppDelegate(config, props);

  return config;
};
