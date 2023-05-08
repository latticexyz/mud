/**
 * To illustrate the usage, here is an example for a Plugin A,
 * which takes { field1: string } as config input,
 * and expands it by copying the field1 value to expandedField1:
 */

import { defineConfig } from "./defineConfig";
import { ExpandConfig, expandConfig } from "./expandConfig";
import { MudPlugin } from "./types";
import { MergeReturnType } from "@latticexyz/common/type-utils";

type InputA = {
  fieldA: string;
  plugins: {
    // By making PluginA part of the expected input type,
    // consumers receive a type error if the plugin is not included
    // in the config
    PluginA: PluginA;
  };
};

type ExpandedA<T = InputA> = T extends InputA ? InputA & { expandedFieldA: T["fieldA"] } : never;

const PluginA = {
  id: "some-super-unique-plugin-id",
  expandConfig: function <T extends InputA>(input: T) {
    return {
      ...input,
      expandedFieldA: input.fieldA,
    } as unknown as ExpandedA<T>;
  },
} as const satisfies MudPlugin<InputA, ExpandedA<InputA>>;

type PluginA = typeof PluginA;

/**
 * To use Plugin A, a consumer could define their config as follows:
 */

const config1 = {
  fieldA: "some-value",
  plugins: {
    PluginA,
  },
  // Note `as const`, which turns config into readonly
  // and adds strong types
} as const satisfies InputA;

/**
 * Assuming we add another Plugin B, which expects fieldB: number as import...
 */

type InputB = { fieldB: number };

const PluginB = {
  id: "even-more-unique-plugin-id",
  expandConfig: function <T extends InputB>(input: T) {
    return input;
  },
} as const satisfies MudPlugin<InputB, InputB>;

// We have type safety in the config definition,
// and the resulting config object has strong types
const config2 = defineConfig({ PluginA }, { fieldA: "someValue" } as const);

/**
 * ...the definition would look like this:
 */

// We have type safety in the config definition,
// and the resulting config object has strong types
const config3 = defineConfig(
  {
    PluginA,
    PluginB,
  },
  {
    fieldA: "some-value", // Try change this to something other than a string and watch TS scream at you
    fieldB: 1,
  } as const
);

// --- Example Usage ---

// config has strong type { fieldA: "val", fieldB: 1, plugins: { PluginA, PluginB } }
const config = defineConfig({ PluginA, PluginB }, { fieldA: "some-value", fieldB: 1 } as const);

// Create a version of `expandConfig` with strong types,
// from which we can infer the merged strong return types
// of all `expandConfig` functions
//
// typedExpandConfig has type:
// <T>(config: T) => ExpandedA<T> | <T>(config: T) => ExpandedB<T>
const typedExpandConfig = expandConfig as ExpandConfig<typeof config>;
// ExpandedConfig has type:
// ExpandedA<T> & ExpandedB<T>
// = { fieldA: "some-value", expandedFieldA: "some-value", fieldB: 1 }
type ExpandedConfig = MergeReturnType<typeof typedExpandConfig<typeof config>>;
const expandedConfig = expandConfig(config) as ExpandedConfig;

expandedConfig.fieldA;
expandedConfig.expandedFieldA;
