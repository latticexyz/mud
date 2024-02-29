import { mapObject } from "@latticexyz/common/utils";
import { ValueSchema } from "@latticexyz/store";

export function flattenSchema<schema extends ValueSchema>(
  schema: schema
): { readonly [k in keyof schema]: schema[k]["type"] } {
  return mapObject(schema, (value) => value.type);
}
