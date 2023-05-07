import { UnionToIntersection } from "@latticexyz/common/type-utils";
import { Plugins } from "./types";

// Helper type to infer the input types from a plugins config as union (InputA | InputB)
type PluginsInput<P extends Plugins> = Parameters<P[keyof P]["expandConfig"]>[0];

// Infer the plugin input types as intersection (InputA & InputB)
type MergedPluginsInput<P extends Plugins> = UnionToIntersection<PluginsInput<P>>;

// Helper function to define the config while keeping strong types.
// We omit the `plugins` key from the required config because it is
// defined separately in this helper function.
export function defineConfig<P extends Plugins, C extends Omit<MergedPluginsInput<P>, "plugins">>(
  plugins: P,
  config: C
): C & { plugins: P } {
  // We include the plugins in the output type
  return { ...config, plugins };
}
