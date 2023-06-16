import { UnionToIntersection } from "@latticexyz/common/type-utils";
import { MudPlugin, Plugins } from "./types";

// Helper type to infer the input types from a plugins config as union (InputA | InputB)
type PluginsInput<P extends Plugins> = Parameters<P[keyof P]["expandConfig"]>[0];

/**
 * Infer the plugin input types as intersection (InputA & InputB)
 */
export type MergedPluginsInput<P extends Plugins> = UnionToIntersection<PluginsInput<P>>;

/**
 * Helper function to typecheck a plugin definition.
 */
export function defineMUDPlugin<P extends MudPlugin>(plugin: P): P {
  return plugin;
}

/**
 * Helper function to typecheck a config.
 */
export function mudCoreConfig<P extends Plugins, C extends MergedPluginsInput<P>>(config: { plugins: P } & C) {
  return config;
}

/**
 * Helper function to sequentially apply `expandConfig` of each plugin.
 * Use ExpandConfig to strongly type the result.
 *
 * Usage:
 * ```
 * const _typedExpandConfig = expandConfig as ExpandConfig<typeof config>;
 * type ExpandedConfig = MergeReturnType<typeof _typedExpandConfig<typeof config>>;
 * const expandedConfig = expandConfig(config) as ExpandedConfig;
 * ```
 *
 * TODO explain HKTs and why this can't just return `MergeReturnType<ExpandConfig<C><C>>`
 */
export function expandConfig<C extends { plugins: Plugins }>(config: C): Record<string, unknown> {
  let expanded = config;
  for (const plugin of Object.values(config.plugins)) {
    expanded = { ...expanded, ...plugin.expandConfig(config) };
  }
  return expanded;
}
