/* eslint-disable @typescript-eslint/no-empty-interface */
import { pluginA } from "./plugin.A";
import { pluginB } from "./plugin.B";
import { FullConfig, ShorthandConfig } from "./plugin.basetypes";

const a = { field1: "", field2: "", plugins: {} } satisfies ShorthandConfig;

export function expandConfig<TShorthandConfig extends ShorthandConfig>(
  config: TShorthandConfig
): FullConfig<TShorthandConfig> {
  return {
    // TODO: iterate through all plugins and call expand config on them
  } as FullConfig<TShorthandConfig>;
}

const fullConfig = expandConfig({ field1: "hello", field2: "world", plugins: { pluginA } } as const);

fullConfig;

fullConfig.expandedField1;
fullConfig.expandedField2;
