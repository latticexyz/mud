import { mapObject } from "@latticexyz/common/utils";
import {
  AbiTypeScope,
  Scope,
  extendedScope,
  getPath,
  hasOwnKey,
  isObject,
  isTableShorthandInput,
  resolveTableShorthand,
  resolveTablesWithShorthands,
  validateTablesWithShorthands,
} from "@latticexyz/store/config/v2";
import { WorldWithShorthandsInput } from "./input";
import { validateNamespace } from "./namespaces";
import { resolveWorld, validateWorld } from "./world";

export type resolveWorldWithShorthands<world> = resolveWorld<{
  [key in keyof world]: key extends "tables"
    ? resolveTablesWithShorthands<world[key], extendedScope<world>>
    : key extends "namespaces"
      ? {
          [namespaceLabel in keyof world[key]]: {
            [namespaceOption in keyof world[key][namespaceLabel]]: namespaceOption extends "tables"
              ? resolveTablesWithShorthands<world[key][namespaceLabel][namespaceOption], extendedScope<world>>
              : world[key][namespaceLabel][namespaceOption];
          };
        }
      : world[key];
}>;

export type validateWorldWithShorthands<world> = {
  [key in keyof world]: key extends "tables"
    ? validateTablesWithShorthands<world[key], extendedScope<world>>
    : key extends "namespaces"
      ? validateNamespacesWithShorthands<world[key], extendedScope<world>>
      : validateWorld<world>[key];
};

function validateWorldWithShorthands(world: unknown): asserts world is WorldWithShorthandsInput {
  const scope = extendedScope(world);

  if (hasOwnKey(world, "tables")) {
    validateTablesWithShorthands(world.tables, scope);
  }

  if (hasOwnKey(world, "namespaces") && isObject(world.namespaces)) {
    for (const label of Object.keys(world.namespaces)) {
      validateTablesWithShorthands(getPath(world.namespaces, [label, "tables"]) ?? {}, scope);
    }
  }
}

export type validateNamespacesWithShorthands<namespaces, scope extends Scope = AbiTypeScope> = {
  [label in keyof namespaces]: {
    [key in keyof namespaces[label]]: key extends "tables"
      ? validateTablesWithShorthands<namespaces[label][key], scope>
      : validateNamespace<namespaces[label], scope>[key];
  };
};

export function resolveWorldWithShorthands<world extends WorldWithShorthandsInput>(
  world: world,
): resolveWorldWithShorthands<world> {
  const scope = extendedScope(world);

  const tables =
    world.tables != null
      ? mapObject(world.tables, (table) => {
          return isTableShorthandInput(table) ? resolveTableShorthand(table, scope) : table;
        })
      : null;

  const namespaces =
    world.namespaces != null
      ? mapObject(world.namespaces, (namespace) => {
          const tables =
            namespace.tables != null
              ? mapObject(namespace.tables, (table) => {
                  return isTableShorthandInput(table) ? resolveTableShorthand(table, scope) : table;
                })
              : null;
          return {
            ...namespace,
            ...(tables != null ? { tables } : null),
          };
        })
      : null;

  const fullConfig = {
    ...world,
    ...(tables != null ? { tables } : null),
    ...(namespaces != null ? { namespaces } : null),
  };

  validateWorld(fullConfig);

  return resolveWorld(fullConfig) as never;
}

export function defineWorldWithShorthands<world>(
  world: validateWorldWithShorthands<world>,
): resolveWorldWithShorthands<world> {
  validateWorldWithShorthands(world);
  return resolveWorldWithShorthands(world) as never;
}
