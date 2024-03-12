import { conform } from "@arktype/util";
import { get, hasOwnKey } from "./generics";
import { SchemaInput, isSchemaInput } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";
import { isStaticAbiType } from "@latticexyz/schema-type";

export type TableFullInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  primaryKey extends ValidKeys<schema, scope> = ValidKeys<schema, scope>,
> = {
  schema: schema;
  primaryKey: primaryKey;
};

export type ValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = readonly [
  getStaticAbiTypeKeys<schema, scope>,
  ...getStaticAbiTypeKeys<schema, scope>[],
];

function getValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope>(
  schema: schema,
  scope: scope = AbiTypeScope as scope,
) {
  return Object.entries(schema)
    .filter(([, internalType]) => hasOwnKey(scope.types, internalType) && isStaticAbiType(scope.types[internalType]))
    .map(([key]) => key);
}

export function isValidPrimaryKey<schema extends SchemaInput<scope>, scope extends AbiTypeScope>(
  primaryKey: unknown,
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): primaryKey is ValidKeys<schema, scope> {
  return (
    Array.isArray(primaryKey) &&
    primaryKey.every(
      (key) =>
        hasOwnKey(schema, key) && hasOwnKey(scope.types, schema[key]) && isStaticAbiType(scope.types[schema[key]]),
    )
  );
}

export function isTableFullInput(input: unknown): input is TableFullInput {
  return (
    typeof input === "object" &&
    input !== null &&
    hasOwnKey(input, "schema") &&
    hasOwnKey(input, "primaryKey") &&
    Array.isArray(input["primaryKey"])
  );
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export type validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: key extends "primaryKey"
    ? validateKeys<getStaticAbiTypeKeys<conform<get<input, "schema">, SchemaInput<scope>>, scope>, input[key]>
    : key extends "schema"
      ? conform<input[key], SchemaInput<scope>>
      : input[key];
};

export function validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as scope,
) {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected full table config, got ${JSON.stringify(input)}`);
  }

  if (!hasOwnKey(input, "schema") || !isSchemaInput(input["schema"], scope)) {
    throw new Error("Invalid schema input");
  }

  if (!hasOwnKey(input, "primaryKey") || !isValidPrimaryKey(input["primaryKey"], input["schema"], scope)) {
    throw new Error(
      `Invalid primary key. Expected (${getValidKeys(input["schema"], scope).join("|")})[], received ${hasOwnKey(input, "primaryKey") ? `[${input["primaryKey"]}]` : "undefined"}`,
    );
  }
}
