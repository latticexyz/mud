import { MergeReturnType, UnionToIntersection } from "@latticexyz/common/type-utils";
import { Config, MudPlugin, Plugins } from "./types";

// Helper type to infer the input types from a plugins config as union (InputA | InputB)
type PluginsInput<P extends Plugins> = Parameters<P[keyof P]["expandConfig"]>[0];

// Infer the plugin input types as intersection (InputA & InputB)
export type MergedPluginsInput<P extends Plugins> = UnionToIntersection<PluginsInput<P>>;

// Helper to strongly type a plugin definition
export function defineMUDPlugin<P extends MudPlugin>(plugin: P): P {
  return plugin;
}

/**
 * Helper function to sequentially apply `expandConfig` of each plugin and strongly type the result.
 */
export function mudCoreConfig<P extends Plugins, C extends Config & MergedPluginsInput<P>>(
  config: C
): MergeReturnType<P[keyof P]["expandConfig"]> {
  let expanded = config as any;
  for (const { expandConfig } of Object.values(config.plugins)) {
    expanded = { ...expanded, ...expandConfig(config) };
  }
  return expanded;
}
