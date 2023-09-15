import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type";
import { ValueSchema, SchemaToPrimitives } from "@latticexyz/protocol-parser";

export function schemaToDefaults<TSchema extends ValueSchema>(valueSchema: TSchema): SchemaToPrimitives<TSchema> {
  return Object.fromEntries(
    Object.entries(valueSchema).map(([key, abiType]) => [key, schemaAbiTypeToDefaultValue[abiType]])
  ) as SchemaToPrimitives<TSchema>;
}
