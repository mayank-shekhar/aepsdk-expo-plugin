import { ConfigPlugin, withPodfile, withXcodeProject, withAppDelegate } from "@expo/config-plugins";
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
  "@adobe/react-native-aepcore": "AEPMobileCore",
  "@adobe/react-native-aepuserprofile": "AEPMobileUserProfile",
  "@adobe/react-native-aepedge": "AEPMobileEdge",
  "@adobe/react-native-aepassurance": "AEPMobileAssurance",
  "@adobe/react-native-aepedgeidentity": "AEPMobileEdgeIdentity",
  "@adobe/react-native-aepedgeconsent": "AEPMobileEdgeConsent",
  "@adobe/react-native-aepedgebridge": "AEPMobileEdgeBridge",
  "@adobe/react-native-aepmessaging": "AEPMobileMessaging",
  "@adobe/react-native-aepoptimize": "AEPMobileOptimize",
  "@adobe/react-native-aepplaces": "AEPMobilePlaces",
  "@adobe/react-native-aeptarget": "AEPMobileTarget",
  "@adobe/react-native-aepcampaignclassic": "AEPMobileCampaignClassic",
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
        // Modify the build settings to add -fcxx-modules flag in the Other C Flags
        if (!buildSettings['OTHER_CPLUSPLUSFLAGS']
            || buildSettings['OTHER_CPLUSPLUSFLAGS'] === INHERITED) {
          buildSettings[ 'OTHER_CPLUSPLUSFLAGS' ] = [ INHERITED ];

          // Add -fcxx-modules flag to the Other C++ Flags
          buildSettings[ 'OTHER_CPLUSPLUSFLAGS' ].push("-fcxx-modules");
          buildSettings['OTHER_CPLUSPLUSFLAGS'].push("-Wno-module-import-in-extern-c");
        }
        buildSettings['LD_RUNPATH_SEARCH_PATHS'] = ["/usr/lib/swift", INHERITED];
      }
    }
    config.modResults = pbxproj;

    return config
  });
};

// Create a new config plugin to create new AdobeBridge.h and AdobeBridge.m files and add it to ios project
export const withCoreBridgeFiles: ConfigPlugin<SdkConfigurationProps> = (config, {environmentFileId, logLevel}) => {
  return withXcodeProject(config, (config) => {
    const { modResults } = config;
    const projectName = path.basename(config.modRequest.projectName);

    let logLevelCode = `  `;
    if (logLevel == "DEBUG") {
      logLevelCode = `[AEPMobileCore setLogLevel:AEPLogLevelDebug];`
    } else if (logLevel == "ERROR") {
      logLevelCode = `[AEPMobileCore setLogLevel:AEPLogLevelError];`
    } else if (logLevel == "WARNING") {
      logLevelCode = `[AEPMobileCore setLogLevel:AEPLogLevelWarning];`
    } else if (logLevel == "VERBOSE" || logLevel == "INFO") {
      logLevelCode = `[AEPMobileCore setLogLevel:AEPLogLevelTrace];`
    } else {
      logLevelCode = `[AEPMobileCore setLogLevel:AEPLogLevelError];`
    }

    // Get the ios project path
    const projectPath = path.join(process.cwd(), `ios/${projectName}`);

    // Create the AdobeBridge.h file
    const bridgeHeaderPath = path.join(projectPath, 'AdobeBridge.h');
    if (!fs.existsSync(bridgeHeaderPath)) {
      fs.writeFileSync(bridgeHeaderPath, `#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
@interface AdobeBridge : NSObject
+ (void)configure: (UIApplicationState)state;
@end`);
    }

    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs
      .readFileSync(packageJsonPath, "utf8")
    );

    const dependencies = packageJson.dependencies;

    let extensions = `AEPMobileIdentity.class, AEPMobileLifecycle.class, AEPMobileSignal.class`;

    const importsToAdd = ['@import AEPCore;', '@import AEPLifecycle;', '@import AEPSignal;', '@import AEPIdentity;'];
    for (const [name] of Object.entries(dependencies)) {
      if (name.startsWith("@adobe/react-native-aepcore")) {
        continue;
      } else {
        // check if name is in the iosSdkMap
        if (iosSdkMap[ name ]) {
          importsToAdd.push(`@import ${iosSdkMap[ name ]};`);
          extensions = extensions + `, ${iosSdkClassMap[ name ]}.class`;
        }
      }
    }

    if (importsToAdd.length === 0) {
      throw new Error("No SDKs found in package.json. Please add the SDKs to the project.")
    } else {
      if (!importsToAdd.includes('@import AEPServices;')) {
        importsToAdd.push('@import AEPServices;')
      }
    }

    // Add AEP SDK import code in app delegate file
    const importCode = importsToAdd.join("\n");

    // Add the imports to AppDelegate.h file
    const appDelegateHeaderPath = path.join(projectPath, 'AppDelegate.h');
    let appDelegateHeader = fs.readFileSync(appDelegateHeaderPath, 'utf8');

    // remove all the code between @import AEPCore and @import AEPServices
    const importRegex = /@import AEPCore;(.*\n)*@import AEPServices;/;

    // check if file contains @import AEPCore and @import AEPServices
    if (!appDelegateHeader.includes('@import AEPCore;') || !appDelegateHeader.includes('@import AEPServices;')) {
      appDelegateHeader = appDelegateHeader.replace(
        /#import <RCTAppDelegate.h>/,
        `#import <RCTAppDelegate.h>\n${importCode}`
      );
    } else {
      appDelegateHeader = appDelegateHeader.replace(importRegex, importCode);
    }
    fs.writeFileSync(appDelegateHeaderPath, appDelegateHeader);

    // Create the AdobeBridge.m file
    const bridgeImplementationPath = path.join(projectPath, 'AdobeBridge.m');
      fs.writeFileSync(bridgeImplementationPath, `
#import "AdobeBridge.h"
#import "AppDelegate.h"
#import <UIKit/UIKit.h>

@implementation AdobeBridge
+ (void)configure: (UIApplicationState)appState
{
  ${logLevelCode}
  NSArray *extensionsToRegister = @[${extensions}];
      [AEPMobileCore registerExtensions:extensionsToRegister completion:^{
        [AEPMobileCore configureWithAppId: @"${environmentFileId}"];
        if (appState != UIApplicationStateBackground) {
            [AEPMobileCore lifecycleStart:@{@"": @""}];
        }
    }];
}
@end`);

     // Update the xcode project file to include the AdobeBridge files
    // const pbxproj = modResults;
    // const headerFileRef = pbxproj.generateUuid(),
    //   headerFileUuid = pbxproj.generateUuid(),
    //   implementationFileRef = pbxproj.generateUuid(),
    //   implementationFileUuid = pbxproj.generateUuid();
    // const bridgeHeaderFile = {
    //   fileRef: headerFileRef,
    //   uuid: headerFileUuid,
    //   group: 'Sources',
    //   isBuildFile: false,
    //   basename: 'AdobeBridge.h',
    //   path: `${projectName}/AdobeBridge.h`,
    //   sourceTree: '"<group>"',
    //   fileEncoding: '4',
    //   lastKnownFileType: 'sourcecode.c.h',
    // };
    // const bridgeImplementationFile = {
    //   fileRef: implementationFileRef,
    //   uuid: implementationFileUuid,
    //   group: 'Sources',
    //   isBuildFile: true,
    //   basename: 'AdobeBridge.m',
    //   path: `${projectName}/AdobeBridge.m`,
    //   sourceTree: '"<group>"',
    //   fileEncoding: '4',
    //   lastKnownFileType: 'sourcecode.c.objc',
    // };

    // pbxproj.removeFromPbxBuildFileSection(bridgeImplementationFile);

    // pbxproj.addToPbxBuildFileSection(bridgeImplementationFile);


    // pbxproj.removeFromPbxFileReferenceSection(bridgeHeaderFile);
    // pbxproj.removeFromPbxFileReferenceSection(bridgeImplementationFile);
    // pbxproj.addToPbxFileReferenceSection(bridgeHeaderFile);
    // pbxproj.addToPbxFileReferenceSection(bridgeImplementationFile);


    // // get first target

    // const pbxGroupKey = pbxproj.findPBXGroupKey({ name: projectName });

    // // first remove if already present in PXXGroup, and then add file to prjectName PBXGroup
    // pbxproj.removeFromPbxGroup(bridgeHeaderFile, pbxGroupKey);
    // pbxproj.removeFromPbxGroup(bridgeImplementationFile, pbxGroupKey);
    // pbxproj.addToPbxGroup(bridgeHeaderFile, pbxGroupKey);
    // pbxproj.addToPbxGroup(bridgeImplementationFile, pbxGroupKey);

    // // Add AdobeBridge.m to build phase section
    // pbxproj.addToPbxSourcesBuildPhase({
    //     ...bridgeImplementationFile,
    //     target: pbxproj.getFirstTarget().uuid,
    // });

    // Update AppDelegate.h to include #import <ExpoModulesCore/EXAppDelegateWrapper.h> if it doesn't already

    // place #import <Expo/Expo.h> with #import <ExpoModulesCore/EXAppDelegateWrapper.h>
    if (appDelegateHeader.includes('#import <Expo/Expo.h>') && !appDelegateHeader.includes('#import <ExpoModulesCore/EXAppDelegateWrapper.h>')) {
      appDelegateHeader = appDelegateHeader.replace(
        /#import <Expo\/Expo.h>/,
        `#import <ExpoModulesCore/EXAppDelegateWrapper.h>`
      );
      fs.writeFileSync(appDelegateHeaderPath, appDelegateHeader);
    }

    return config;
  });
}

export const withUpdatedAppDelegate: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props
) => {
  return withAppDelegate(config, (config) => {
    let appDelegateContent = config.modResults.contents;

    // Add the import statements for AdobeBridge files
    const importCode = `#import "AdobeBridge.h"`;

    if (!appDelegateContent.includes(importCode)) {
      appDelegateContent = appDelegateContent.replace(
        /#import "AppDelegate.h"/,
        `#import "AppDelegate.h"\n${importCode}`
      );
    }

    // Add the AdobeBridge configuration code

    const bridgeInitCode = `
  [AdobeBridge configure: application.applicationState];
  `;
    if (appDelegateContent.includes("[AdobeBridge configure: application.applicationState];")) {
      return config;
    } else {
      appDelegateContent = appDelegateContent.replace(
        /self.initialProps = @{};/,
        `self.initialProps = @{};\n${bridgeInitCode}`
      );
    }

    config.modResults.contents = appDelegateContent;

    return config;
  });
};

export const withLifeCycleListener: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props
) => {
  return withAppDelegate(config, (config) => {
    // in appDelegate.mm file, check if applicationDidEnterBackground and applicationWillEnterForeground methods are present
    // if not, add the methods
    let appDelegateContent = config.modResults.contents;

    const applicationDidEnterBackgroundCode = `
- (void)applicationDidEnterBackground:(UIApplication *)application {
  [AEPMobileCore lifecyclePause];
}
`;

    const applicationWillEnterForegroundCode = `
- (void)applicationWillEnterForeground:(UIApplication *)application {
  [AEPMobileCore lifecycleStart:nil];
}
`;

    // Add the above code before end of the file, before the @end string
    if (!appDelegateContent.includes(applicationDidEnterBackgroundCode)) {
      appDelegateContent = appDelegateContent.replace(
        /@end/,
        `${applicationDidEnterBackgroundCode}\n@end`
      );
    }

    if (!appDelegateContent.includes(applicationWillEnterForegroundCode)) {
      appDelegateContent = appDelegateContent.replace(
        /@end/,
        `${applicationWillEnterForegroundCode}\n@end`
      );
    }

    config.modResults.contents = appDelegateContent;

    return config;
  });
};

export const withCoreiOSSdk: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  if (props.allowPodFileChanges) {
    config = withCorePodfile(config, props);
  }
  if (props.allowBuildSettingsChanges) {
    config = withCoreXcodeProject(config, props);
  }
  if (props.allowNativeChanges) {
    config = withCoreBridgeFiles(config, props);
    config = withUpdatedAppDelegate(config, props);
  }

  if (props.allowLifeCycleChanges) {
    config = withLifeCycleListener(config, props);
  }

  return config;
};
