export type MUDPlugin = (config: MUDCoreUserConfig) => MUDCoreConfig;

export interface MUDCoreUserConfig {
  plugins: MUDPlugin[];
}

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
