import { conform } from "@arktype/util";
import { get, keyof } from "./generics";
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

export function isValidPrimaryKey<schema extends SchemaInput<scope>, scope extends AbiTypeScope>(
  primaryKey: unknown,
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): primaryKey is ValidKeys<schema, scope> {
  return (
    Array.isArray(primaryKey) &&
    primaryKey.every(
      (key) => keyof(key, schema) && keyof(schema[key], scope.types) && isStaticAbiType(scope.types[schema[key]]),
    )
  );
}

export function isTableFullInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is TableFullInput<SchemaInput<scope>, scope> {
  return (
    typeof input === "object" &&
    input !== null &&
    keyof("schema", input) &&
    isSchemaInput(input["schema"], scope) &&
    keyof("primaryKey", input) &&
    isValidPrimaryKey(input["primaryKey"], input["schema"], scope)
  );
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export function validateKeys<validKeys extends PropertyKey, keys = PropertyKey[]>(keys: validateKeys<validKeys, keys>) {
  throw new Error("validateKeys not implemented");
}

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

  if (!keyof("schema", input) || !isSchemaInput(input["schema"], scope)) {
    throw new Error("Invalid schema input");
  }

  if (!keyof("primaryKey", input) || !isValidPrimaryKey(input["primaryKey"], input["schema"], scope)) {
    throw new Error("Invalid primary key");
  }
}
