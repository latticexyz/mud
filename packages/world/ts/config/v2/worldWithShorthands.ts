import { mapObject } from "@latticexyz/common/utils";
import {
  extendedScope,
  getPath,
  hasOwnKey,
  isObject,
  isTableShorthandInput,
  shorthandToTableInput,
  expandShorthandTables,
  validateShorthandTables,
} from "@latticexyz/store/config/v2";
import { WorldWithShorthandsInput } from "./input";
import { resolveWorld, validateWorld } from "./world";

export type validateWorldWithShorthands<world> = {
  [key in keyof world]: key extends "tables"
    ? validateShorthandTables<world[key], extendedScope<world>>
    : validateWorld<world>[key];
};

function validateWorldWithShorthands(world: unknown): asserts world is WorldWithShorthandsInput {
  const scope = extendedScope(world);
  if (hasOwnKey(world, "tables")) {
    validateShorthandTables(world.tables, scope);
  }

  if (hasOwnKey(world, "namespaces") && isObject(world.namespaces)) {
    for (const namespaceKey of Object.keys(world.namespaces)) {
      validateShorthandTables(getPath(world.namespaces, [namespaceKey, "tables"]) ?? {}, scope);
    }
  }
}

export type resolveWorldWithShorthands<world> = resolveWorld<{
  readonly [key in keyof world]: key extends "tables"
    ? expandShorthandTables<world[key], extendedScope<world>>
    : world[key];
}>;

export function resolveWorldWithShorthands<world extends WorldWithShorthandsInput>(
  world: world,
): resolveWorldWithShorthands<world> {
  const scope = extendedScope(world);
  const tables = world.tables
    ? mapObject(world.tables, (table) => {
        return isTableShorthandInput(table) ? shorthandToTableInput(table, scope) : table;
      })
    : null;

  const fullConfig = {
    ...world,
    ...(tables ? { tables } : null),
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
