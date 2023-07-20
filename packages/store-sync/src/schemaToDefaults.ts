import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type";
import { ValueSchema, SchemaToPrimitives } from "./common";

export function schemaToDefaults<TSchema extends ValueSchema>(schema: TSchema): SchemaToPrimitives<TSchema> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, abiType]) => [key, schemaAbiTypeToDefaultValue[abiType]])
  ) as SchemaToPrimitives<TSchema>;
}
