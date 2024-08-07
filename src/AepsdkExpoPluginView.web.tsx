import * as React from 'react';

import { AepsdkExpoPluginViewProps } from './AepsdkExpoPlugin.types';

export default function AepsdkExpoPluginView(props: AepsdkExpoPluginViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
