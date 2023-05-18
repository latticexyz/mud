import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { hexToArray } from "@latticexyz/utils";
import { Schema } from "../common";
import { decodeStaticField } from "./decodeStaticField";
import { decodeDynamicField } from "./decodeDynamicField";

export const decodeField = (schema: Schema, schemaIndex: number, hexData: string): Record<number, any> => {
  const data: Record<number, any> = {};
  const bytes = hexToArray(hexData);

  schema.staticFields.forEach((fieldType, index) => {
    if (index === schemaIndex) {
      data[schemaIndex] = decodeStaticField(fieldType as StaticAbiType, bytes, 0);
    }
  });

  if (schema.dynamicFields.length > 0) {
    schema.dynamicFields.forEach((fieldType, i) => {
      const index = schema.staticFields.length + i;
      if (index === schemaIndex) {
        data[schemaIndex] = decodeDynamicField(fieldType as DynamicAbiType, bytes);
      }
    });
  }

  return data;
};
