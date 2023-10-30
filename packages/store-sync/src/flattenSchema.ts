import { mapObject } from "@latticexyz/common/utils";
import { SchemaAbiType } from "@latticexyz/schema-type";

export function flattenSchema<schema extends Record<string, { type: SchemaAbiType }>>(
  schema: schema
): { [k in keyof schema]: schema[k]["type"] } {
  return mapObject(schema, (value) => value.type);
}
