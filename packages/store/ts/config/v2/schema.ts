import { evaluate } from "@arktype/util";
import { AbiTypeScope, AnyTypeScope } from "./scope";
import { hasOwnKey } from "./generics";

export type SchemaInput<scope extends AnyTypeScope = AnyTypeScope> = {
  [key: string]: keyof scope["types"] & string;
};

export type ResolvedSchema<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AnyTypeScope = AnyTypeScope,
> = resolveSchema<schema, scope>;

export type resolveSchema<schema extends SchemaInput, scope extends AnyTypeScope> = evaluate<{
  readonly [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    readonly type: scope["types"][schema[key]] & keyof AbiTypeScope["types"];
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: schema[key];
  };
}>;

export function resolveSchema<const schema extends SchemaInput<scope>, scope extends AbiTypeScope = AbiTypeScope>(
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

export function isSchemaInput<scope extends AnyTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as unknown as scope,
): input is SchemaInput<scope> & typeof input {
  return typeof input === "object" && input != null && Object.values(input).every((key) => hasOwnKey(scope.types, key));
}
