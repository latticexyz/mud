import {
  AbiTypeScope,
  extendedScope,
  get,
  hasOwnKey,
  isObject,
  isTableShorthandInput,
  resolveTableShorthand,
  resolveTablesWithShorthands,
  validateTablesWithShorthands,
  validateTableShorthand,
  Scope,
} from "@latticexyz/store/config/v2";
import { mapObject } from "@latticexyz/common/utils";
import { resolveWorld, validateWorld } from "./world";
import { WorldWithShorthandsInput } from "./input";
import { validateNamespaces } from "./namespaces";

export type resolveWorldWithShorthands<world> = resolveWorld<{
  [key in keyof world]: key extends "tables"
    ? resolveTablesWithShorthands<world[key], extendedScope<world>>
    : key extends "namespaces"
      ? {
          [namespaceKey in keyof world[key]]: {
            [namespaceProp in keyof world[key][namespaceKey]]: namespaceProp extends "tables"
              ? resolveTablesWithShorthands<world[key][namespaceKey][namespaceProp], extendedScope<world>>
              : world[key][namespaceKey][namespaceProp];
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
    for (const namespaceKey of Object.keys(world.namespaces)) {
      validateTablesWithShorthands(get(get(world.namespaces, namespaceKey), "tables") ?? {}, scope);
    }
  }
}

export type validateNamespacesWithShorthands<namespaces, scope extends Scope = AbiTypeScope> = {
  [namespace in keyof namespaces]: {
    [key in keyof namespaces[namespace]]: key extends "tables"
      ? validateTablesWithShorthands<namespaces[namespace][key], scope>
      : validateNamespaces<namespaces[namespace], scope>[key];
  };
};

export function resolveWorldWithShorthands<world>(world: world): resolveWorldWithShorthands<world> {
  validateWorldWithShorthands(world);

  const scope = extendedScope(world);
  const tables = mapObject(world.tables ?? {}, (table) => {
    return isTableShorthandInput(table)
      ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
      : table;
  });
  const namespaces = mapObject(world.namespaces ?? {}, (namespace) => ({
    ...namespace,
    tables: mapObject(namespace.tables ?? {}, (table) => {
      return isTableShorthandInput(table)
        ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
        : table;
    }),
  }));

  const fullConfig = { ...world, tables, namespaces };

  return resolveWorld(fullConfig) as unknown as resolveWorldWithShorthands<world>;
}

export function defineWorldWithShorthands<world>(
  world: validateWorldWithShorthands<world>,
): resolveWorldWithShorthands<world> {
  return resolveWorldWithShorthands(world) as resolveWorldWithShorthands<world>;
}
