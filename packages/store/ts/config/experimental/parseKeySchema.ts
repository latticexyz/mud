import { StaticAbiType, isStaticAbiType } from "@latticexyz/schema-type";

export type KeySchema = { readonly [k: string]: StaticAbiType };

export const defaultKeySchema = { key: "bytes32" } as const satisfies KeySchema;

export type ParseKeySchemaInput = StaticAbiType | KeySchema | undefined;

export type ParseKeySchemaOutput<TInput extends ParseKeySchemaInput> = TInput extends undefined
  ? typeof defaultKeySchema
  : TInput extends StaticAbiType
  ? { readonly key: TInput }
  : TInput extends KeySchema
  ? TInput
  : never;

export function parseKeySchema<TInput extends ParseKeySchemaInput>(input: TInput): ParseKeySchemaOutput<TInput> {
  return (
    input === undefined ? defaultKeySchema : isStaticAbiType(input) ? { key: input } : input
  ) as ParseKeySchemaOutput<TInput>;
}
