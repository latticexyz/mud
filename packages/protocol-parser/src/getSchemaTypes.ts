import { Schema } from "@latticexyz/config";
import { mapObject } from "@latticexyz/common/utils";

export type getSchemaTypes<schema extends Schema> = {
  readonly [fieldName in keyof schema]: schema[fieldName]["type"];
};

export function getSchemaTypes<schema extends Schema>(schema: schema): getSchemaTypes<schema> {
  return mapObject(schema, (value) => value.type);
}
