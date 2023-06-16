import {
  SchemaType,
  DynamicSchemaType,
  SchemaTypeArrayToElement,
  getStaticByteLength,
  SchemaTypeToPrimitiveType,
} from "@latticexyz/schema-type";
import { toHex, bytesToString } from "viem";
import { decodeStaticField } from "./decodeStaticField";

// TODO: figure out how to switch back to `fieldType: never` for exhaustiveness check
const unsupportedDynamicField = (fieldType: SchemaType): never => {
  throw new Error(`Unsupported dynamic field type: ${SchemaType[fieldType] ?? fieldType}`);
};

export const decodeDynamicField = <T extends DynamicSchemaType, P extends SchemaTypeToPrimitiveType<T>>(
  fieldType: T,
  bytes: Uint8Array
): P => {
  if (fieldType === SchemaType.BYTES) {
    return toHex(bytes) as P;
  }
  if (fieldType === SchemaType.STRING) {
    return bytesToString(bytes) as P;
  }

  const staticType = SchemaTypeArrayToElement[fieldType];
  if (staticType !== undefined) {
    const fieldLength = getStaticByteLength(staticType);
    const arrayLength = bytes.byteLength / fieldLength;
    return new Array(arrayLength)
      .fill(undefined)
      .map((_, i) => decodeStaticField(staticType, bytes, i * fieldLength)) as any as P;
  }

  return unsupportedDynamicField(fieldType);
};
