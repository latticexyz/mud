import { SchemaToPrimitives, ValueSchema } from "@latticexyz/protocol-parser/internal";

export function cleanStrings<TSchema extends ValueSchema>(
  schema: TSchema,
  value: SchemaToPrimitives<TSchema>,
): SchemaToPrimitives<TSchema> {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [key, schema[key] === "string" ? value.replaceAll("\x00", "") : value]),
  ) as SchemaToPrimitives<TSchema>;
}
