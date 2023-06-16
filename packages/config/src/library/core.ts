import { MUDCoreContext } from "./context";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MUDCoreUserConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MUDCoreConfig {}

export type MUDConfigExtender = (config: MUDCoreConfig) => Record<string, unknown>;

/** Resolver that sequentially passes the config through all the plugins */
export function mudCoreConfig(config: MUDCoreUserConfig): MUDCoreConfig {
  // config types can change with plugins, `any` helps avoid errors when typechecking dependencies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let configAsAny = config as any;
  const context = MUDCoreContext.getContext();
  for (const extender of context.configExtenders) {
    configAsAny = extender(configAsAny);
  }
  return configAsAny;
}

/** Utility for plugin developers to extend the core config */
export function extendMUDCoreConfig(extender: MUDConfigExtender) {
  const context = MUDCoreContext.getContext();
  context.configExtenders.push(extender);
}
