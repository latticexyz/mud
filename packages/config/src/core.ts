import { z } from "zod";

export type MUDPlugin = (config: MUDCoreUserConfig) => MUDCoreConfig;

// zod can't validate the config object as it's dynamically defined by the plugins themselves
export const zMUDPlugin = z.function().args(z.any()).returns(z.any()).array();

export interface MUDCoreUserConfig {
  plugins: MUDPlugin[];
}

export const zMUDCoreUserConfig = z.object({
  plugins: zMUDPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MUDCoreConfig extends Required<MUDCoreUserConfig> {}

/** Type helper for defining StoreUserConfig */
export function mudCoreConfig(config: MUDCoreUserConfig): MUDCoreConfig {
  const plugins = config.plugins;
  for (const plugin of plugins) {
    config = plugin(config);
  }
  return config as MUDCoreConfig;
}
