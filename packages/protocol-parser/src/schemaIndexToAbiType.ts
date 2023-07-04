import { SchemaAbiType } from "@latticexyz/schema-type";
import { Schema } from "./common";

export function schemaIndexToAbiType(schema: Schema, schemaIndex: number): SchemaAbiType {
  if (schemaIndex < schema.staticFields.length) {
    return schema.staticFields[schemaIndex];
  }
  return schema.dynamicFields[schemaIndex - schema.staticFields.length];
}
