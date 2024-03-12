import { evaluate } from "@arktype/util";
import { AbiTypeScope } from "./scope";
import { keyof } from "./generics";

export type SchemaInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: keyof scope["types"];
};

export type resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = evaluate<{
  readonly [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    readonly type: scope["types"][schema[key]];
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: schema[key];
  };
}>;

export function resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope = AbiTypeScope>(
  schema: schema,
  scope?: scope,
): resolveSchema<schema, scope> {
  const resolvedScope = scope ?? AbiTypeScope;
  return Object.fromEntries(
    Object.entries(schema).map(([key, internalType]) => {
      if (keyof(internalType, resolvedScope.types)) {
        return [
          key,
          {
            type: resolvedScope.types[internalType],
            internalType,
          },
        ];
      }
      throw new Error(`"${String(internalType)}" is not a valid type in this scope.`);
    }),
  ) as unknown as resolveSchema<schema, scope>;
}

export function isSchemaInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is SchemaInput<scope> {
  return (
    typeof input === "object" && input !== null && Object.values(input).every((key) => Object.hasOwn(scope.types, key))
  );
}
