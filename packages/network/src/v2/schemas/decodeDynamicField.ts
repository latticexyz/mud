import { SchemaType, DynamicSchemaType, SchemaTypeArrayToElement, getStaticByteLength } from "@latticexyz/schema-type";
import { toHex, bytesToString } from "viem";
import { decodeStaticField } from "./decodeStaticField";

// TODO: figure out how to switch back to `fieldType: never` for exhaustiveness check
const unsupportedDynamicField = (fieldType: SchemaType): never => {
  throw new Error(`Unsupported dynamic field type: ${SchemaType[fieldType] ?? fieldType}`);
};

// TODO: figure out how to use with SchemaTypeToPrimitiveType<T> return type to ensure correctness here
export const decodeDynamicField = <T extends DynamicSchemaType>(fieldType: T, bytes: Uint8Array) => {
  if (fieldType === SchemaType.BYTES) {
    return toHex(bytes);
  }
  if (fieldType === SchemaType.STRING) {
    return bytesToString(bytes);
  }

  const staticType = SchemaTypeArrayToElement[fieldType];
  if (staticType !== undefined) {
    const fieldLength = getStaticByteLength(staticType);
    const arrayLength = bytes.byteLength / fieldLength;
    return new Array(arrayLength).fill(undefined).map((_, i) => decodeStaticField(staticType, bytes, i * fieldLength));
  }

  return unsupportedDynamicField(fieldType);
};
