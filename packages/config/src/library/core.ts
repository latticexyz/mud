import { MUDError } from "@latticexyz/common/errors";
import { MUDCoreContext } from "./context";
import { MUDConfigExtender, MUDCoreConfig, MUDCoreUserConfig, MUDHooks } from "./types";

/** Resolver that sequentially passes the config through all the plugins */
export function mudCoreConfig(config: MUDCoreUserConfig): MUDCoreConfig {
  // config types can change with plugins, `any` helps avoid errors when typechecking dependencies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let configAsAny = config as any;
  const context = MUDCoreContext.getContext();

  context.hooks.beforeAll.call(configAsAny);
  for (const extender of context.configExtenders) {
    configAsAny = extender(configAsAny);
  }
  context.hooks.afterAll.call(configAsAny);

  return configAsAny;
}

/** Utility for plugin developers to extend the core config */
export function extendMUDCoreConfig(extender: MUDConfigExtender) {
  const context = MUDCoreContext.getContext();
  context.configExtenders.push(extender);
}

export function initializeMUDHook<T extends keyof MUDHooks>(name: T, hook: MUDHooks[T]) {
  const context = MUDCoreContext.getContext();
  if (context.hooks[name]) {
    throw new MUDError(`Hook "${name}" has already been initialized`);
  }
  context.hooks[name] = hook;
}

export function getMudHook(name: keyof MUDHooks) {
  const context = MUDCoreContext.getContext();
  const hook = context.hooks[name];
  if (!hook) {
    throw new MUDError(`Hook "${name}" has not been initialized`);
  }
  return hook;
}
