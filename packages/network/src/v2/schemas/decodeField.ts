import { DynamicSchemaType, StaticSchemaType } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { TableSchema } from "../common";
import { decodeStaticField } from "./decodeStaticField";
import { decodeDynamicField } from "./decodeDynamicField";

export const decodeField = (schema: TableSchema, schemaIndex: number, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = new DataView(hexToArray(hexData).buffer);

  schema.staticFields.forEach((fieldType, index) => {
    if (index === schemaIndex) {
      data[schemaIndex] = decodeStaticField(fieldType as StaticSchemaType, bytes, 0);
    }
  });

  if (schema.dynamicFields.length > 0) {
    schema.dynamicFields.forEach((fieldType, i) => {
      const index = schema.staticFields.length + i;
      if (index === schemaIndex) {
        data[schemaIndex] = decodeDynamicField(fieldType as DynamicSchemaType, bytes.buffer);
      }
    });
  }

  return data;
};
