export * from "./defaults";
export * from "./plugin";
export * from "./storeConfig";

import { mudCoreConfig, Plugins, MergedPluginsInput } from "@latticexyz/config";
import { ExtractUserTypes, MergeReturnType, StringForUnion } from "@latticexyz/common/type-utils";
import { ExpandStoreUserConfig, MUDUserConfig } from "./storeConfig";

/** mudCoreConfig wrapper to use generics in some options for better type inference */
export function mudConfig<
  P extends Plugins,
  C extends Omit<MergedPluginsInput<P>, "plugins">,
  // (`never` is overridden by inference, so only the defined enums can be used by default)
  EnumNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>
>(
  config: MUDUserConfig<P, C, EnumNames, StaticUserTypes> & { plugins: Plugins }
): MergeReturnType<P[keyof P]["expandConfig"]> &
  ExpandStoreUserConfig<MUDUserConfig<P, C, EnumNames, StaticUserTypes> & { plugins: Plugins }> {
  const { plugins, ...configWithoutPlugins } = config;
  return mudCoreConfig(plugins, configWithoutPlugins);
}
