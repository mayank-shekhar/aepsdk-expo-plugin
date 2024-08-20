import { ConfigPlugin, withInfoPlist, withPodfile, withXcodeProject } from "@expo/config-plugins";
// import { config } from "process";

import { SdkConfigurationProps } from "./types";

const fs = require("fs");
const path = require("path");


// function nonComments(obj) {
//   var keys = Object.keys(obj),
//       newObj = {}, i = 0;

//   for (i; i < keys.length; i++) {
//       if (!COMMENT_KEY.test(keys[i])) {
//           newObj[keys[i]] = obj[keys[i]];
//       }
//   }

//   return newObj;
// }

// function unquote(str) {
//   if (str) return str.replace(/^"(.*)"$/, "$1");
// }


// map of aep's react native sdk's and their ios counterparts
const iosSdkMap: Record<string, string> = {
  "@adobe/react-native-aepcore": "AEPCore",
  "@adobe/react-native-userprofile": "AEPUserProfile",
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

const iosDependenciesVersionMap: Record<string, string> = {
  "AEPCore": '">= 5.0.0", "< 6.0.0"',
  "AEPServices": '">= 5.0.0", "< 6.0.0"',
  "AEPLifecycle": '">= 5.0.0", "< 6.0.0"',
  "AEPSignal": '">= 5.0.0", "< 6.0.0"',
  "AEPIdentity": '">= 5.0.0", "< 6.0.0"',
  "AEPUserProfile": '">= 5.0.0", "< 6.0.0"',
  "AEPEdge": '">= 5.0.0", "< 6.0.0"',
  "AEPAssurance": '">= 5.0.0", "< 6.0.0"',
  "AEPEdgeIdentity": '">= 5.0.0", "< 6.0.0"',
  "AEPEdgeConsent": '">= 5.0.0", "< 6.0.0"',
  "AEPEdgeBridge": '">= 5.0.0", "< 6.0.0"',
  "AEPMessaging": '">= 5.0.0", "< 6.0.0"',
  "AEPOptimize": '">= 5.0.0", "< 6.0.0"',
  "AEPPlaces": '">= 5.0.0", "< 6.0.0"',
  "AEPTarget": '">= 5.0.0", "< 6.0.0"',
  "AEPCampaignClassic": '">= 5.0.0", "< 6.0.0"',
};


const withCoreInfoPlist: ConfigPlugin<SdkConfigurationProps> = (
  config,
  { logLevel, environmentFileId, extensions },
) => {

  // if (!config.ios) {
  //   config.ios = {};
  // }

  // if (!config.ios.infoPlist) {
  //   config.ios.infoPlist = {};
  // }

  // config.ios.infoPlist[ "AEP_Environment_File_Id" ] = environmentFileId;
  // config.ios.infoPlist[ "AEP_Log_Level" ] = logLevel;
  // config.ios.infoPlist[ "AEP_Extensions" ] = extensions;
  // return config;

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

    if (extensions) {
      config.modResults.AEPSDK = {
        ...config.modResults.AEPSDK,
        extensions,
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

    // Read the application dependencies from package.json and add pod dependencies using the podfile API
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs
      .readFileSync(packageJsonPath, "utf8")
    );

    const dependencies = packageJson.dependencies;
    const podDependencies = [];
    for (const [name] of Object.entries(dependencies)) {
      if (name.startsWith("@adobe/react-native-aepcore")) {
        // podDependencies.push(`  pod 'AEPCore', '${iosDependenciesVersionMap[ "AEPCore" ]}'`);
        // podDependencies.push(`  pod 'AEPLifecycle', '${iosDependenciesVersionMap[ "AEPLifecycle" ]}'`);
        // podDependencies.push(`  pod 'AEPSignal', '${iosDependenciesVersionMap[ "AEPSignal" ]}'`);
        // podDependencies.push(`  pod 'AEPServices', '${iosDependenciesVersionMap[ "AEPServices" ]}'`);
        // podDependencies.push(`  pod 'AEPIdentity', '${iosDependenciesVersionMap[ "AEPIdentity" ]}'`);


        podDependencies.push(`  pod 'AEPCore'`);
        podDependencies.push(`  pod 'AEPLifecycle'`);
        podDependencies.push(`  pod 'AEPSignal'`);
        podDependencies.push(`  pod 'AEPServices'`);
        podDependencies.push(`  pod 'AEPIdentity'`);
      } else {
        // check if name is in the iosSdkMap
        if (iosSdkMap[ name ])
          podDependencies.push(`  pod '${iosSdkMap[name]}'`);
      }
    }

    // Push Core dependencies 'AEPLifecycle', 'AEPSignal', 'AEPServices' after the core in the list


    // get target name from podfile contents such as 'target 'app' do'
    const targetName = podFile.contents.match(/target '(.*?)' do/)?.[1] || "app";


    // create dependency string
    const dependencyString = podDependencies.join("\n");

    // Add the pod dependencies to the podfile contents which is string
    if (!podFile.contents.includes(dependencyString)) {
      podFile.contents = podFile.contents.replace(
        `target '${targetName}' do`,
        `target '${targetName}' do\n${dependencyString}`,
      );
    }

    const codeToAdd = `
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
      console.log("config", config);
      buildSettings = configurations[ config ].buildSettings;

      console.log("buildSettings", buildSettings);

      if (!buildSettings) {
        continue;

        // if (!buildSettings['FRAMEWORK_SEARCH_PATHS']
        //     || buildSettings['FRAMEWORK_SEARCH_PATHS'] === INHERITED) {
        //     buildSettings['FRAMEWORK_SEARCH_PATHS'] = [INHERITED];
        // }

        // buildSettings['FRAMEWORK_SEARCH_PATHS'].push(searchPathForFile(file, this));
      } else {

        // Modify the build settings to add -fcxx-modules flag in the Other C Flags
        if (!buildSettings['OTHER_CFLAGS']
            || buildSettings['OTHER_CFLAGS'] === INHERITED) {
          buildSettings[ 'OTHER_CFLAGS' ] = [ INHERITED ];

          // Add -fcxx-modules flag to the Other C Flags
          buildSettings[ 'OTHER_CFLAGS' ].push("-fcxx-modules");
        }

      }
      console.log("updated buildSettings", buildSettings);
    }

    return config
  });

};

export const withCoreiOSSdk: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  config = withCorePodfile(config, props);
  config = withCoreInfoPlist(config, props);
  // config = withCoreXcodeProject(config, props);

  return config;
};
