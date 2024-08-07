import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { AepsdkExpoPluginViewProps } from './AepsdkExpoPlugin.types';

const NativeView: React.ComponentType<AepsdkExpoPluginViewProps> =
  requireNativeViewManager('AepsdkExpoPlugin');

export default function AepsdkExpoPluginView(props: AepsdkExpoPluginViewProps) {
  return <NativeView {...props} />;
}
