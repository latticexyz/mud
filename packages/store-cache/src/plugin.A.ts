/* eslint-disable @typescript-eslint/no-empty-interface */

import { MudPlugin, ShorthandConfig } from "./plugin.basetypes";

// Plugin A

type ShorthandConfigA = {
  field1: string;
  plugins: Record<string, MudPlugin> & { pluginA: typeof pluginA };
};

interface FullConfigA<TShorthandConfig extends ShorthandConfig> {
  expandedField1: `${TShorthandConfig["field1"]}-expanded`;
}

// Extend global interfaces
declare module "./plugin.basetypes" {
  interface ShorthandConfig extends ShorthandConfigA {}
  interface FullConfig<TShorthandConfig extends ShorthandConfig> extends FullConfigA<TShorthandConfig> {}
}

export const pluginA = {
  expandConfig<T extends ShorthandConfig>(shorthandConfig: T): FullConfigA<T> {
    return { expandedField1: `${shorthandConfig.field1}-expanded` } as FullConfigA<T>;
  },
} satisfies MudPlugin;
