import { SchemaType } from "@latticexyz/schema-type";
import { arrayToHex } from "@latticexyz/utils";

const unsupportedDynamicField = (fieldType: SchemaType): never => {
  throw new Error(`Unsupported dynamic field type: ${SchemaType[fieldType] ?? fieldType}`);
};

// TODO: decode per dynamic field type, so we get better return types for each field type
export const decodeDynamicField = (fieldType: SchemaType, data: ArrayBuffer): ArrayBuffer | string => {
  switch (fieldType) {
    case SchemaType.BYTES:
      return arrayToHex(data);
    case SchemaType.STRING:
      return new TextDecoder().decode(data);
    // TODO: array types
    default:
      return unsupportedDynamicField(fieldType);
  }
};
