import { Schema } from "@latticexyz/config";
import { SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";

export type getSchemaPrimitives<schema extends Schema> = {
  readonly [fieldName in keyof schema]: SchemaAbiTypeToPrimitiveType<schema[fieldName]["type"]>;
};
