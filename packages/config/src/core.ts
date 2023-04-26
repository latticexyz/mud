import { z } from "zod";

// TODO more specific types
export type MUDPlugin = any;

export const zMUDPlugin = z.any().array();

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
