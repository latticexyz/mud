import { SchemaToPrimitives, ValueSchema } from "@latticexyz/protocol-parser/internal";
import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";

export function schemaToDefaults<TSchema extends ValueSchema>(valueSchema: TSchema): SchemaToPrimitives<TSchema> {
  return Object.fromEntries(
    Object.entries(valueSchema).map(([key, abiType]) => [key, schemaAbiTypeToDefaultValue[abiType]]),
  ) as SchemaToPrimitives<TSchema>;
}
