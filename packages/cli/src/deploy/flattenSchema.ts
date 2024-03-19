import { mapObject } from "@latticexyz/common/utils";
import { Schema } from "@latticexyz/store/config/v2";

export type flattenSchema<schema extends Schema> = {
  readonly [k in keyof schema]: schema[k]["type"];
};

export function flattenSchema<schema extends Schema>(schema: schema): flattenSchema<schema> {
  return mapObject(schema, (value) => value.type);
}
