import { conform, evaluate, narrow } from "@arktype/util";
import { mapObject } from "@latticexyz/common/utils";
import {
  UserTypes,
  extendedScope,
  get,
  resolveTable,
  validateTable,
  resolveCodegen as resolveStoreCodegen,
  mergeIfUndefined,
  validateTables,
  resolveStore,
  resolveTables,
  Store,
} from "@latticexyz/store/config/v2";
import { SystemsInput, WorldInput } from "./input";
import { CONFIG_DEFAULTS } from "./defaults";
import { Tables } from "@latticexyz/store";
import { resolveSystems } from "./systems";
import { resolveNamespacedTables, validateNamespaces } from "./namespaces";
import { resolveCodegen } from "./codegen";
import { resolveDeployment } from "./deployment";

export type validateWorld<world> = {
  readonly [key in keyof world]: key extends "tables"
    ? validateTables<world[key], extendedScope<world>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<world[key]>
        : key extends "namespaces"
          ? validateNamespaces<world[key], extendedScope<world>>
          : key extends keyof WorldInput
            ? conform<world[key], WorldInput[key]>
            : world[key];
};

export function validateWorld(world: unknown): asserts world is WorldInput {
  //
}

export type resolveWorld<world> = evaluate<
  resolveStore<world> &
    mergeIfUndefined<
      { tables: resolveNamespacedTables<world> } & Omit<
        {
          [key in keyof world]: key extends "systems"
            ? resolveSystems<world[key] & SystemsInput>
            : key extends "deployment"
              ? resolveDeployment<world[key]>
              : key extends "codegen"
                ? resolveCodegen<world[key]>
                : world[key];
        },
        "namespaces" | keyof Store
      >,
      typeof CONFIG_DEFAULTS
    >
>;

export function resolveWorld<const world>(world: world): resolveWorld<world> {
  validateWorld(world);

  const scope = extendedScope(world);
  const namespace = get(world, "namespace") ?? "";

  const namespaces = get(world, "namespaces") ?? {};
  validateNamespaces(namespaces, scope);

  const rootTables = get(world, "tables") ?? {};
  validateTables(rootTables, scope);

  const resolvedNamespacedTables = Object.fromEntries(
    Object.entries(namespaces)
      .map(([namespaceKey, namespace]) =>
        Object.entries(namespace.tables).map(([tableKey, table]) => {
          validateTable(table, scope);
          return [
            `${namespaceKey}__${tableKey}`,
            resolveTable(mergeIfUndefined(table, { namespace: namespaceKey, name: tableKey }), scope),
          ];
        }),
      )
      .flat(),
  ) as Tables;

  const resolvedRootTables = resolveTables(
    mapObject(rootTables, (table) => mergeIfUndefined(table, { namespace })),
    scope,
  );

  return mergeIfUndefined(
    {
      tables: { ...resolvedRootTables, ...resolvedNamespacedTables },
      userTypes: world.userTypes ?? {},
      enums: world.enums ?? {},
      namespace,
      codegen: mergeIfUndefined(resolveStoreCodegen(world.codegen), resolveCodegen(world.codegen)),
      deployment: resolveDeployment(world.deployment),
      systems: resolveSystems(world.systems ?? CONFIG_DEFAULTS.systems),
      excludeSystems: get(world, "excludeSystems"),
      modules: world.modules,
    },
    CONFIG_DEFAULTS,
  ) as unknown as resolveWorld<world>;
}

export function defineWorld<const world>(world: validateWorld<world>): resolveWorld<world> {
  return resolveWorld(world) as unknown as resolveWorld<world>;
}
