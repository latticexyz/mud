/* eslint-disable @typescript-eslint/no-empty-interface */

import { MudPlugin, ShorthandConfig } from "./plugin.basetypes";

// Plugin B

type ShorthandConfigB = {
  field2: string;
  plugins: Record<string, MudPlugin> & { pluginB: typeof pluginB };
};

interface FullConfigB<TShorthandConfig extends ShorthandConfig> {
  expandedField2: `${TShorthandConfig["field2"]}-expanded`;
}

// Extend global interfaces
declare module "./plugin.basetypes" {
  interface ShorthandConfig extends ShorthandConfigB {}
  interface FullConfig<TShorthandConfig extends ShorthandConfig> extends FullConfigB<TShorthandConfig> {}
}

export const pluginB = {
  expandConfig<T extends ShorthandConfig>(shorthandConfig: T): FullConfigB<T> {
    return { expandedField2: `${shorthandConfig.field2}-expanded` } as FullConfigB<T>;
  },
} satisfies MudPlugin;
