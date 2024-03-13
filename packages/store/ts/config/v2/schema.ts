import { evaluate } from "@arktype/util";
import { AbiType, AbiTypeScope } from "./scope";
import { hasOwnKey } from "./generics";

export type SchemaInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: keyof scope["types"];
};

export type resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = evaluate<{
  readonly [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    readonly type: scope["types"][schema[key]] & AbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: schema[key];
  };
}>;

export function resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope = AbiTypeScope>(
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): resolveSchema<schema, scope> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, internalType]) => {
      if (hasOwnKey(scope.types, internalType)) {
        return [
          key,
          {
            type: scope.types[internalType],
            internalType,
          },
        ];
      }
      throw new Error(`"${String(internalType)}" is not a valid type in this scope.`);
    }),
  ) as resolveSchema<schema, scope>;
}

export function isSchemaInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is SchemaInput<scope> {
  return typeof input === "object" && input != null && Object.values(input).every((key) => hasOwnKey(scope.types, key));
}
