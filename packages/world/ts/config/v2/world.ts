import { ErrorMessage, conform, narrow, type withJsDoc } from "@arktype/util";
import {
  UserTypes,
  extendedScope,
  get,
  resolveTable,
  validateTable,
  mergeIfUndefined,
  validateTables,
  resolveStore,
  Store,
  hasOwnKey,
  validateStore,
} from "@latticexyz/store/config/v2";
import { SystemsInput, WorldInput } from "./input";
import { CONFIG_DEFAULTS, MODULE_DEFAULTS } from "./defaults";
import { Tables } from "@latticexyz/store/internal";
import { resolveSystems, validateSystems } from "./systems";
import { resolveNamespacedTables, validateNamespaces } from "./namespaces";
import { resolveCodegen } from "./codegen";
import { resolveDeploy } from "./deploy";
import type { World } from "./output.js";

export type validateWorld<world> = {
  readonly [key in keyof world]: key extends "tables"
    ? validateTables<world[key], extendedScope<world>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<world[key]>
        : key extends "systems"
          ? validateSystems<world[key]>
          : key extends "namespaces"
            ? // ? validateNamespaces<world[key], extendedScope<world>>
              ErrorMessage<`Namespaces config will be enabled soon.`>
            : key extends keyof WorldInput
              ? conform<world[key], WorldInput[key]>
              : ErrorMessage<`\`${key & string}\` is not a valid World config option.`>;
};

export function validateWorld(world: unknown): asserts world is WorldInput {
  const scope = extendedScope(world);
  validateStore(world);

  if (hasOwnKey(world, "systems")) {
    validateSystems(world.systems);
  }
  if (hasOwnKey(world, "namespaces")) {
    validateNamespaces(world.namespaces, scope);
  }
}

export type resolveWorld<world, namespace = resolveStore<world>["namespace"]> = withJsDoc<
  resolveStore<world> &
    mergeIfUndefined<
      { readonly tables: resolveNamespacedTables<world> } & {
        [key in Exclude<keyof world, keyof Store>]: key extends "systems"
          ? resolveSystems<world[key] & SystemsInput, namespace & string>
          : key extends "deploy"
            ? resolveDeploy<world[key]>
            : key extends "codegen"
              ? resolveCodegen<world[key]>
              : world[key];
      },
      CONFIG_DEFAULTS
    >,
  World
>;

export function resolveWorld<const world extends WorldInput>(world: world): resolveWorld<world> {
  const scope = extendedScope(world);
  const resolvedStore = resolveStore(world);
  const namespaces = world.namespaces ?? {};

  const resolvedNamespacedTables = Object.fromEntries(
    Object.entries(namespaces)
      .map(([namespaceKey, namespace]) =>
        Object.entries(namespace.tables ?? {}).map(([tableKey, table]) => {
          validateTable(table, scope);
          return [
            `${namespaceKey}__${tableKey}`,
            resolveTable(mergeIfUndefined(table, { namespace: namespaceKey, name: tableKey }), scope),
          ];
        }),
      )
      .flat(),
  ) as Tables;

  const modules = (world.modules ?? CONFIG_DEFAULTS.modules).map((mod) => mergeIfUndefined(mod, MODULE_DEFAULTS));

  return mergeIfUndefined(
    {
      ...resolvedStore,
      tables: { ...resolvedStore.tables, ...resolvedNamespacedTables },
      codegen: mergeIfUndefined(resolvedStore.codegen, resolveCodegen(world.codegen)),
      deploy: resolveDeploy(world.deploy),
      systems: resolveSystems(world.systems ?? CONFIG_DEFAULTS.systems, resolvedStore.namespace),
      excludeSystems: get(world, "excludeSystems"),
      modules,
    },
    CONFIG_DEFAULTS,
  ) as never;
}

export function defineWorld<const input>(input: validateWorld<input>): resolveWorld<input> {
  validateWorld(input);
  return resolveWorld(input) as never;
}
