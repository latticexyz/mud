/**
 * One important requirement is the ability for plugins to expand the config
 * (by adding more fields, expanding shortcut fields to the full definitons,
 * setting default values, etc), and for us to maintain strong types,
 * even with those arbitrary expansions, so other type definitions can depend
 * on the fully expanded config.
 */

import { Config, MudPlugin } from "./types";

/**
 * Helper function to apply all `expandConfig` functions
 * TypeScript can't infer a strong type from this, but we can
 * still achieve it by defining a helper type below
 */
export function expandConfig<C extends Config>(config: C) {
  let expanded = config;
  for (const plugin of Object.values(config.plugins)) {
    expanded = { ...expanded, ...plugin.expandConfig(config) };
  }
  return expanded;
}

/*
 * Helper type to turn a strongly typed config into a union of
 * all `expandConfig` functions defined in the config
 *
 * Usage:
 * ```
 * const typedExpandConfig = expandConfig as ExpandConfig<typeof config>;
 * type ExpandedConfig = MergeReturnType<typeof typedExpandConfig<typeof config>>;
 * const expandedConfig = expandConfig(config) as ExpandedConfig;
 * ```
 */
export type ExpandConfig<C> = C extends { plugins: infer Plugins }
  ? Plugins extends Record<string, MudPlugin>
    ? Plugins[keyof Plugins]["expandConfig"]
    : never
  : never;
