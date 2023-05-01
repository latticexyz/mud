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

export interface MUDCoreConfig {
  plugins: MUDPlugin[];
}

/** Resolver that sequentially passes the config through all the plugins */
export function mudCoreConfig(config: MUDCoreUserConfig): MUDCoreConfig {
  const plugins = config.plugins;
  for (const plugin of plugins) {
    config = plugin(config);
  }
  return config as MUDCoreConfig;
}
