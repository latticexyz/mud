import { conform, evaluate } from "@arktype/util";
import { AbiTypeScope, Scope } from "./scope";
import { hasOwnKey, isObject } from "./generics";
import { SchemaInput } from "./input";

export type validateSchema<schema, scope extends Scope = AbiTypeScope> = {
  [key in keyof schema]: conform<schema[key], keyof scope["types"]>;
};

export function validateSchema<scope extends Scope = AbiTypeScope>(
  schema: unknown,
  scope: scope = AbiTypeScope as unknown as scope,
): asserts schema is SchemaInput {
  if (!isObject(schema)) {
    throw new Error(`Expected schema, received ${JSON.stringify(schema)}`);
  }

  for (const internalType of Object.values(schema)) {
    if (!hasOwnKey(scope.types, internalType)) {
      throw new Error(`"${String(internalType)}" is not a valid type in this scope.`);
    }
  }
}

export type resolveSchema<schema, scope extends Scope> = evaluate<{
  readonly [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    readonly type: scope["types"][schema[key] & keyof scope["types"]];
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: schema[key];
  };
}>;

export function resolveSchema<schema, scope extends Scope = AbiTypeScope>(
  schema: schema,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveSchema<schema, scope> {
  validateSchema(schema, scope);

  return Object.fromEntries(
    Object.entries(schema).map(([key, internalType]) => [
      key,
      {
        type: scope.types[internalType as keyof typeof scope.types],
        internalType,
      },
    ]),
  ) as unknown as resolveSchema<schema, scope>;
}

export function defineSchema<schema, scope extends AbiTypeScope = AbiTypeScope>(
  schema: validateSchema<schema, scope>,
  scope: scope = AbiTypeScope as scope,
): resolveSchema<schema, scope> {
  return resolveSchema(schema, scope) as resolveSchema<schema, scope>;
}

/** @deprecated */
export function isSchemaInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is SchemaInput {
  return typeof input === "object" && input != null && Object.values(input).every((key) => hasOwnKey(scope.types, key));
}
