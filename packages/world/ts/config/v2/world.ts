import { ErrorMessage, conform, evaluate, narrow } from "@arktype/util";
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
import { resolveSystems } from "./systems";
import { resolveNamespacedTables, validateNamespaces } from "./namespaces";
import { resolveCodegen } from "./codegen";
import { resolveDeploy } from "./deploy";

export type validateWorld<world> = {
  readonly [key in keyof world]: key extends "tables"
    ? validateTables<world[key], extendedScope<world>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<world[key]>
        : key extends "namespaces"
          ? // TODO: revisit this pattern (https://github.com/latticexyz/mud/pull/2898)
            world extends { namespace?: unknown; tables?: unknown; systems?: unknown }
            ? ErrorMessage<"Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.">
            : validateNamespaces<world[key], extendedScope<world>>
          : key extends keyof WorldInput
            ? conform<world[key], WorldInput[key]>
            : ErrorMessage<`\`${key & string}\` is not a valid World config option.`>;
};

export function validateWorld(world: unknown): asserts world is WorldInput {
  const scope = extendedScope(world);
  validateStore(world);

  if (hasOwnKey(world, "namespaces")) {
    if (hasOwnKey(world, "namespace") || hasOwnKey(world, "tables") || hasOwnKey(world, "systems")) {
      throw new Error("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.");
    }
    validateNamespaces(world.namespaces, scope);
  }
}

export type resolveWorld<world> = evaluate<
  resolveStore<world> &
    mergeIfUndefined<
      { tables: resolveNamespacedTables<world> } & Omit<
        {
          [key in keyof world]: key extends "systems"
            ? resolveSystems<world[key] & SystemsInput>
            : key extends "deploy"
              ? resolveDeploy<world[key]>
              : key extends "codegen"
                ? resolveCodegen<world[key]>
                : world[key];
        },
        "namespaces" | keyof Store
      >,
      CONFIG_DEFAULTS
    >
>;

export function resolveWorld<const world extends WorldInput>(world: world): resolveWorld<world> {
  const scope = extendedScope(world);

  const resolvedStore = resolveStore({
    ...world,
    codegen: mergeIfUndefined(world.codegen ?? {}, {
      // TODO: move this into `resolveStore` once it supports `namespaces` key?
      // TODO: deprecate this option or make it not configurable? we're just using it for now to determine if a config is in single or multi namespace mode
      namespaceDirectories: world.namespaces != null,
      // don't generate `index.sol` if we're using `namespaces` key, to avoid naming conflicts for table names across namespaces
      // this is a deprecated option anyway, so this default guides folks towards not using it
      indexFilename: world.namespaces != null ? false : undefined,
    }),
  });

  const resolvedNamespacedTables = Object.fromEntries(
    Object.entries(world.namespaces ?? {})
      .map(([namespaceKey, namespace]) =>
        Object.entries(namespace.tables ?? {}).map(([tableKey, table]) => {
          validateTable(table, scope);
          return [
            `${namespaceKey}__${tableKey}`,
            resolveTable(
              mergeIfUndefined(table, {
                // TODO: decide if these should be overridable at the table level
                namespace: namespaceKey,
                name: tableKey,
              }),
              scope,
            ),
          ];
        }),
      )
      .flat(),
  ) as Tables;

  const modules = (world.modules ?? CONFIG_DEFAULTS.modules).map((mod) => mergeIfUndefined(mod, MODULE_DEFAULTS));

  // TODO: add resolved namespaces

  return mergeIfUndefined(
    {
      ...resolvedStore,
      tables: { ...resolvedStore.tables, ...resolvedNamespacedTables },
      codegen: mergeIfUndefined(resolvedStore.codegen, resolveCodegen(world.codegen)),
      deploy: resolveDeploy(world.deploy),
      systems: resolveSystems(world.systems ?? CONFIG_DEFAULTS.systems),
      excludeSystems: get(world, "excludeSystems"),
      modules,
    },
    CONFIG_DEFAULTS,
  ) as never;
}

export function defineWorld<const world>(world: validateWorld<world>): resolveWorld<world> {
  validateWorld(world);
  return resolveWorld(world) as never;
}
