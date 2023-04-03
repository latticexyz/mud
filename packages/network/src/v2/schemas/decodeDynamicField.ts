import { SchemaType, DynamicSchemaType, SchemaTypeArrayToElement, getStaticByteLength } from "@latticexyz/schema-type";
import { arrayToHex } from "@latticexyz/utils";
import { decodeStaticField } from "./decodeStaticField";

// TODO: figure out how to switch back to `fieldType: never` for exhaustiveness check
const unsupportedDynamicField = (fieldType: SchemaType): never => {
  throw new Error(`Unsupported dynamic field type: ${SchemaType[fieldType] ?? fieldType}`);
};

// TODO: figure out how to use with SchemaTypeToPrimitive<T> return type to ensure correctness here
export const decodeDynamicField = <T extends DynamicSchemaType>(fieldType: T, bytes: Uint8Array) => {
  if (fieldType === SchemaType.BYTES) {
    return arrayToHex(bytes);
  }
  if (fieldType === SchemaType.STRING) {
    return new TextDecoder().decode(bytes);
  }

  const staticType = SchemaTypeArrayToElement[fieldType];
  if (staticType !== undefined) {
    const fieldLength = getStaticByteLength(staticType);
    const arrayLength = bytes.byteLength / fieldLength;
    return new Array(arrayLength).fill(undefined).map((_, i) => decodeStaticField(staticType, bytes, i * fieldLength));
  }

  return unsupportedDynamicField(fieldType);
};
