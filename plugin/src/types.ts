export type SdkConfigurationProps = {
  environmentFileId?: string;
  logLevel?: 'VERBOSE' | 'DEBUG' | 'ERROR' | 'WARNING' | 'INFO';
  extensions?: string[];
};
