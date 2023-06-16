export * from "./defaults";
export * from "./plugin";
export * from "./storeConfig";

import { Plugins, MergedPluginsInput } from "@latticexyz/config";
import { ExtractUserTypes, StringForUnion } from "@latticexyz/common/type-utils";
import { MUDUserConfig } from "./storeConfig";

/**
 * Helper function to typecheck a config.
 * This is an alternative to mudCoreConfig that uses more generics for type inference of user-defined types.
 */
export function mudConfig<
  P extends Plugins,
  C extends MergedPluginsInput<P>,
  // (`never` is overridden by inference, so only the defined enums can be used by default)
  EnumNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>
>(config: { plugins: P } & MUDUserConfig<P, C, EnumNames, StaticUserTypes>): { plugins: P } & C {
  return config as any;
}
