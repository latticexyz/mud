import { ErrorMessage, conform } from "@arktype/util";
import { FixedArrayAbiType, isFixedArrayAbiType, isStaticAbiType } from "@latticexyz/schema-type/internal";
import { get, hasOwnKey, isObject } from "./generics";
import { isSchemaInput } from "./schema";
import { AbiTypeScope, Scope, getStaticAbiTypeKeys } from "./scope";
import { SchemaInput, ScopedSchemaInput, TablesWithShorthandsInput } from "./input";
import { TableShorthandInput } from "./input";
import { ValidateTableOptions, validateTable } from "./table";

export const NoStaticKeyFieldError =
  "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.";

export type NoStaticKeyFieldError = ErrorMessage<typeof NoStaticKeyFieldError>;

export function isTableShorthandInput(shorthand: unknown): shorthand is TableShorthandInput {
  return (
    typeof shorthand === "string" ||
    (isObject(shorthand) && Object.values(shorthand).every((value) => typeof value === "string"))
  );
}

export type validateTableWithShorthand<
  table,
  scope extends Scope = AbiTypeScope,
  options extends ValidateTableOptions = { inStoreContext: boolean },
> = table extends TableShorthandInput ? validateTableShorthand<table, scope> : validateTable<table, scope, options>;

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
export type validateTableShorthand<input, scope extends Scope = AbiTypeScope> = input extends SchemaInput
  ? // If a shorthand schema is provided, require it to have a static `id` field
    "id" extends getStaticAbiTypeKeys<input, scope>
    ? // Require all values to be valid types in this scope
      conform<input, ScopedSchemaInput<scope>>
    : NoStaticKeyFieldError
  : // If a fixed array type is provided, accept it
    input extends FixedArrayAbiType
    ? input
    : // If a valid type from the scope is provided, accept it
      input extends keyof scope["types"]
      ? input
      : // If the input is not a valid shorthand, return the expected type
        input extends string
        ? keyof scope["types"]
        : ScopedSchemaInput<scope>;

export function validateTableShorthand<scope extends Scope = AbiTypeScope>(
  shorthand: unknown,
  scope: scope = AbiTypeScope as never,
): asserts shorthand is TableShorthandInput {
  if (typeof shorthand === "string") {
    if (isFixedArrayAbiType(shorthand) || hasOwnKey(scope.types, shorthand)) {
      return;
    }
    throw new Error(`Invalid ABI type. \`${shorthand}\` not found in scope.`);
  }
  if (typeof shorthand === "object" && shorthand !== null) {
    if (isSchemaInput(shorthand, scope)) {
      if (hasOwnKey(shorthand, "id") && isStaticAbiType(scope.types[shorthand.id as keyof typeof scope.types])) {
        return;
      }
      throw new Error(`Invalid schema. Expected an \`id\` field with a static ABI type or an explicit \`key\` option.`);
    }
    throw new Error(`Invalid schema. Are you using invalid types or missing types in your scope?`);
  }
  throw new Error(`Invalid table shorthand.`);
}

export type resolveTableShorthand<shorthand, scope extends Scope = AbiTypeScope> = shorthand extends FixedArrayAbiType
  ? { schema: { id: "bytes32"; value: shorthand }; key: ["id"] }
  : shorthand extends keyof scope["types"]
    ? { schema: { id: "bytes32"; value: shorthand }; key: ["id"] }
    : shorthand extends SchemaInput
      ? "id" extends getStaticAbiTypeKeys<shorthand, scope>
        ? // If the shorthand includes a static field called `id`, use it as `key`
          { schema: shorthand; key: ["id"] }
        : never
      : never;

export function resolveTableShorthand<shorthand extends TableShorthandInput, scope extends Scope = AbiTypeScope>(
  shorthand: shorthand,
  scope: scope = AbiTypeScope as never,
): resolveTableShorthand<shorthand, scope> {
  if (isSchemaInput(shorthand, scope)) {
    return {
      schema: shorthand,
      key: ["id"],
    } as never;
  }

  return {
    schema: {
      id: "bytes32",
      value: shorthand,
    },
    key: ["id"],
  } as never;
}

export function defineTableShorthand<shorthand, scope extends Scope = AbiTypeScope>(
  shorthand: validateTableShorthand<shorthand, scope>,
  scope: scope = AbiTypeScope as never,
): resolveTableShorthand<shorthand, scope> {
  validateTableShorthand(shorthand, scope);
  return resolveTableShorthand(shorthand, scope) as never;
}

/**
 * If a shorthand is provided, it is resolved to a full config.
 * If a full config is provided, it is passed through.
 */
export type resolveTableWithShorthand<table, scope extends Scope = AbiTypeScope> = table extends TableShorthandInput
  ? resolveTableShorthand<table, scope>
  : table;

export type resolveTablesWithShorthands<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: resolveTableWithShorthand<input[key], scope>;
};

export type validateTablesWithShorthands<tables, scope extends Scope = AbiTypeScope> = {
  [key in keyof tables]: validateTableWithShorthand<tables[key], scope, { inStoreContext: true }>;
};

export function validateTablesWithShorthands<scope extends Scope = AbiTypeScope>(
  tables: unknown,
  scope: scope,
): asserts tables is TablesWithShorthandsInput {
  if (isObject(tables)) {
    for (const key of Object.keys(tables)) {
      if (isTableShorthandInput(get(tables, key))) {
        validateTableShorthand(get(tables, key), scope);
      } else {
        validateTable(get(tables, key), scope);
      }
    }
  }
}
