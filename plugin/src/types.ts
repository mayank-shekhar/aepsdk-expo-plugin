export type SdkConfigurationProps = {
  environmentFileId?: string;
  logLevel?: 'VERBOSE' | 'DEBUG' | 'ERROR' | 'WARNING' | 'INFO';
  allowNativeChanges?: boolean;
  allowPodFileChanges?: boolean;
  allowBuildSettingsChanges?: boolean;
  allowLifeCycleChanges?: boolean;
};
