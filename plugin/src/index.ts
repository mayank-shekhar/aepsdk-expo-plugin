import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import { SdkConfigurationProps } from "./types";
import { withCoreiOSSdk } from "./withCoreiOS";
import { withCoreAndroidSdk } from "./withCoreAndroid";

const withSdkConfiguration: ConfigPlugin<SdkConfigurationProps> = (
  config,
  _props,
) => {
  // Add the plugin code here.
  const props = {
    environmentFileId: _props?.environmentFileId || "default-file-id",
    logLevel: _props?.logLevel || "VERBOSE",
    allowNativeChanges: _props?.allowNativeChanges || true,
    allowPodFileChanges: _props?.allowPodFileChanges || true,
    allowBuildSettingsChanges: _props?.allowBuildSettingsChanges || true,
    allowLifeCycleChanges: _props?.allowLifeCycleChanges || true,
  };

  console.log('withSdkConfiguration props:', props);

  config = withCoreiOSSdk(config, props);
  config = withCoreAndroidSdk(config, props);
  return config;
};

const pkg = require("../package.json");

export default createRunOncePlugin(withSdkConfiguration, pkg.name, pkg.version);
