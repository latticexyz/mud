import { Schema } from "@latticexyz/config";
import { SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";

export type schemaToPrimitives<schema extends Schema> = {
  [key in keyof schema]: SchemaAbiTypeToPrimitiveType<schema[key]["type"]>;
};
