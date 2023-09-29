import { SchemaAbiType, isSchemaAbiType } from "@latticexyz/schema-type";

export type ValueSchema = { readonly [k: string]: SchemaAbiType };

export type ParseValueSchemaInput = SchemaAbiType | ValueSchema;

export type ParseValueSchemaOutput<input extends ParseValueSchemaInput> = input extends SchemaAbiType
  ? { readonly value: input }
  : input extends ValueSchema
  ? input
  : never;

export function parseValueSchema<input extends ParseValueSchemaInput>(input: input): ParseValueSchemaOutput<input> {
  return (isSchemaAbiType(input) ? { value: input } : input) as ParseValueSchemaOutput<input>;
}
