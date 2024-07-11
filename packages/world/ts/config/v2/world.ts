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
          ? // ? validateNamespaces<world[key], extendedScope<world>>
            ErrorMessage<`Namespaces config will be enabled soon.`>
          : key extends keyof WorldInput
            ? conform<world[key], WorldInput[key]>
            : ErrorMessage<`\`${key & string}\` is not a valid World config option.`>;
};

export function validateWorld(world: unknown): asserts world is WorldInput {
  const scope = extendedScope(world);
  validateStore(world);

  if (hasOwnKey(world, "namespaces")) {
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

  const resolvedStore = resolveStore(world);

  const modules = (world.modules ?? CONFIG_DEFAULTS.modules).map((mod) => mergeIfUndefined(mod, MODULE_DEFAULTS));

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
