import { ConfigPlugin, withInfoPlist, withPodfile, withXcodeProject } from "@expo/config-plugins";
// import { config } from "process";

import { SdkConfigurationProps } from "./types";

// const fs = require("fs");
// const path = require("path");

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
    const codeToAdd = `
        installer.pods_project.targets.each do |t|
            if t.name.start_with?("AEP")
              t.build_configurations.each do |bc|
                  bc.build_settings['OTHER_SWIFT_FLAGS'] = '$(inherited) -no-verify-emitted-module-interface'
              end
            end
        end
    `;
    const podFile = config.modResults;

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

    // Get the main target
    const mainTarget = pbxproj.getFirstTarget().firstTarget;

    // Get the main target's build configuration list
    const buildConfigurations = mainTarget.buildConfigurationList;

    // Get the build configurations
    const configurations = buildConfigurations.buildConfigurations;

    // Modify the configurations to add --fcxx-modules flag in the Other C Flags
    configurations.forEach((config: { buildSettings: { OTHER_CP: any[]; }; }) => {
      config.buildSettings.OTHER_CP = [
        ...(config.buildSettings.OTHER_CP || []),
        "-fcxx-modules",
      ];
    });

    return config
  });

};

export const withCoreiOSSdk: ConfigPlugin<SdkConfigurationProps> = (
  config,
  props,
) => {
  config = withCorePodfile(config, props);
  config = withCoreInfoPlist(config, props);
  config = withCoreXcodeProject(config, props);

  return config;
};
