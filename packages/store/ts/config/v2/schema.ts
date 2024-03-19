import { conform, evaluate } from "@arktype/util";
import { AbiTypeScope, Scope } from "./scope";
import { hasOwnKey, isObject } from "./generics";
import { SchemaInput } from "./input";
import { StaticAbiType, isStaticAbiType } from "@latticexyz/schema-type/internal";

type FixedArrayAbiType = `${StaticAbiType}[${number}]`;

const fixedArrayAbiTypePattern = /^(\w+)(\[\d+\])$/;

function isFixedArrayAbiType(internalType: string): internalType is FixedArrayAbiType {
  const [, staticAbiType] = internalType.match(fixedArrayAbiTypePattern) ?? [];
  return isStaticAbiType(staticAbiType);
}

type fixedArrayToStaticAbiType<fixedArray extends FixedArrayAbiType> =
  fixedArray extends `${infer staticAbiType}[${number}]` ? staticAbiType : never;

function fixedArrayToStaticAbiType<fixedArray extends FixedArrayAbiType>(
  fixedArray: fixedArray,
): fixedArrayToStaticAbiType<fixedArray> {
  return fixedArray.replace(fixedArrayAbiTypePattern, "$1") as fixedArrayToStaticAbiType<fixedArray>;
}

export type validateSchema<schema, scope extends Scope = AbiTypeScope> = {
  [key in keyof schema]: schema[key] extends FixedArrayAbiType
    ? schema[key]
    : conform<schema[key], keyof scope["types"]>;
};

export function validateSchema<scope extends Scope = AbiTypeScope>(
  schema: unknown,
  scope: scope = AbiTypeScope as unknown as scope,
): asserts schema is SchemaInput {
  if (!isObject(schema)) {
    throw new Error(`Expected schema, received ${JSON.stringify(schema)}`);
  }

  for (const internalType of Object.values(schema)) {
    if (hasOwnKey(scope.types, internalType)) continue;
    if (isFixedArrayAbiType(internalType)) continue;
    throw new Error(`"${String(internalType)}" is not a valid type in this scope.`);
  }
}

export type resolveSchema<schema, scope extends Scope> = evaluate<{
  readonly [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    readonly type: schema[key] extends keyof scope["types"]
      ? scope["types"][schema[key]]
      : schema[key] extends FixedArrayAbiType
        ? `${fixedArrayToStaticAbiType<schema[key]>}[]`
        : never;
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
        type: hasOwnKey(scope.types, internalType)
          ? scope.types[internalType]
          : isFixedArrayAbiType(internalType)
            ? `${fixedArrayToStaticAbiType(internalType)}[]`
            : // TODO: error instead of defaulting to input type?
              internalType,
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

export function isSchemaInput<scope extends Scope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as unknown as scope,
): input is SchemaInput {
  return (
    typeof input === "object" &&
    input != null &&
    Object.values(input).every((fieldType) => hasOwnKey(scope.types, fieldType) || isFixedArrayAbiType(fieldType))
  );
}
