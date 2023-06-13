/*
 * Every plugin defines an `Input`, an `Expanded<T = Input>` type,
 * and a `expandConfig` function to map from `Input` to `Expanded`.
 * Do distinguish plugins from each other in TypeScript, they also define a unique `id` string.
 */
export interface MudPlugin<Input = any, Expanded = any> {
  id: string;
  expandConfig: <C extends Input>(config: C) => Expanded;
}

/**
 * The core config only expects a map of plugins.
 * The config is later expanded by calling the expandConfig method of each
 * plugin in order of appearance in the map. We use a map instead of an array,
 * because it makes it easier to type check for the existence of expected
 * plugins in the map. (Object keys order is guaranteed since ES2015, see
 * https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/
 */
export type Config = { plugins: Plugins };
export type Plugins = Record<string, MudPlugin>;
