import {
  SchemaType,
  SchemaTypeArrayToElement,
  getStaticByteLength,
  DynamicAbiType,
  AbiTypeToSchemaType,
  isArrayAbiType,
  AbiType,
  AbiTypeToPrimitiveType,
  SchemaTypeToAbiType,
  getAbiByteLength,
} from "@latticexyz/schema-type";
import { toHex, bytesToString } from "viem";
import { decodeStaticField } from "./decodeStaticField";

// TODO: figure out how to switch back to `fieldType: never` for exhaustiveness check
const unsupportedDynamicField = (fieldType: DynamicAbiType): never => {
  throw new Error(`Unsupported dynamic field type: ${fieldType}`);
};

export const decodeDynamicField = <T extends DynamicAbiType, P extends AbiTypeToPrimitiveType<T>>(
  fieldType: T,
  bytes: Uint8Array
): P => {
  if (fieldType === "bytes") {
    return toHex(bytes) as P;
  }
  if (fieldType === "string") {
    return bytesToString(bytes) as P;
  }
  if (isArrayAbiType(fieldType)) {
    const staticType = SchemaTypeArrayToElement[AbiTypeToSchemaType[fieldType]];
    if (staticType !== undefined) {
      const fieldLength = getAbiByteLength(fieldType);
      const arrayLength = bytes.byteLength / fieldLength;
      return new Array(arrayLength)
        .fill(undefined)
        .map((_, i) => decodeStaticField(SchemaTypeToAbiType[staticType], bytes, i * fieldLength)) as P;
    }
  }

  return unsupportedDynamicField(fieldType);
};
