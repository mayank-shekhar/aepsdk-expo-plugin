import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to AepsdkExpoPlugin.web.ts
// and on native platforms to AepsdkExpoPlugin.ts
import AepsdkExpoPluginModule from './AepsdkExpoPluginModule';
import AepsdkExpoPluginView from './AepsdkExpoPluginView';
import { ChangeEventPayload, AepsdkExpoPluginViewProps } from './AepsdkExpoPlugin.types';

// Get the native constant value.
export const PI = AepsdkExpoPluginModule.PI;

export function hello(): string {
  return AepsdkExpoPluginModule.hello();
}

export async function setValueAsync(value: string) {
  return await AepsdkExpoPluginModule.setValueAsync(value);
}

const emitter = new EventEmitter(AepsdkExpoPluginModule ?? NativeModulesProxy.AepsdkExpoPlugin);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { AepsdkExpoPluginView, AepsdkExpoPluginViewProps, ChangeEventPayload };
