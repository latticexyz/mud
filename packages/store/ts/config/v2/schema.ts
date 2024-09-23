import { conform, show } from "@ark/util";
import { AbiTypeScope, Scope } from "./scope";
import { hasOwnKey, isObject } from "./generics";
import { SchemaInput } from "./input";
import { FixedArrayAbiType, fixedArrayToArray, isFixedArrayAbiType } from "@latticexyz/schema-type/internal";

export type validateSchema<schema, scope extends Scope = AbiTypeScope> = schema extends string
  ? SchemaInput
  : {
      [key in keyof schema]: schema[key] extends FixedArrayAbiType
        ? schema[key]
        : conform<schema[key], keyof scope["types"]>;
    };

export function validateSchema<scope extends Scope = AbiTypeScope>(
  schema: unknown,
  scope: scope = AbiTypeScope as never,
): asserts schema is SchemaInput {
  if (!isObject(schema)) {
    throw new Error(`Expected schema, received ${JSON.stringify(schema)}`);
  }

  for (const internalType of Object.values(schema)) {
    if (isFixedArrayAbiType(internalType)) continue;
    if (hasOwnKey(scope.types, internalType)) continue;
    throw new Error(`"${String(internalType)}" is not a valid type in this scope.`);
  }
}

export type resolveSchema<schema, scope extends Scope> = show<{
  readonly [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    readonly type: schema[key] extends FixedArrayAbiType
      ? fixedArrayToArray<schema[key]>
      : scope["types"][schema[key] & keyof scope["types"]];
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: schema[key];
  };
}>;

export function resolveSchema<schema extends SchemaInput, scope extends Scope = AbiTypeScope>(
  schema: schema,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveSchema<schema, scope> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, internalType]) => [
      key,
      {
        type: isFixedArrayAbiType(internalType) ? fixedArrayToArray(internalType) : scope.types[internalType as never],
        internalType,
      },
    ]),
  ) as never;
}

export function defineSchema<schema, scope extends AbiTypeScope = AbiTypeScope>(
  schema: validateSchema<schema, scope>,
  scope: scope = AbiTypeScope as scope,
): resolveSchema<schema, scope> {
  validateSchema(schema, scope);
  return resolveSchema(schema, scope) as never;
}

export function isSchemaInput<scope extends Scope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as never,
): input is SchemaInput {
  return (
    typeof input === "object" &&
    input != null &&
    Object.values(input).every((fieldType) => isFixedArrayAbiType(fieldType) || hasOwnKey(scope.types, fieldType))
  );
}
