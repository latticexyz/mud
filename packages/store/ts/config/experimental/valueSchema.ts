import { SchemaAbiType, isSchemaAbiType } from "@latticexyz/schema-type";

export type ValueSchema = Readonly<Record<string, SchemaAbiType>>;

export type ValueSchemaInput = SchemaAbiType | ValueSchema;

export type ValueSchemaOutput<input extends ValueSchemaInput> = input extends SchemaAbiType
  ? Readonly<{ value: input }>
  : input extends ValueSchema
  ? Readonly<input>
  : never;

export function parseValueSchema<input extends ValueSchemaInput>(input: input): ValueSchemaOutput<input> {
  return (isSchemaAbiType(input) ? { value: input } : input) as ValueSchemaOutput<input>;
}
