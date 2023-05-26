import { StaticSchemaType, getStaticByteLength } from "@latticexyz/schema-type";

import { Schema } from "../common";
import { decodeStaticField } from "./decodeStaticField";
import { hexToArray } from "@latticexyz/utils";

export function decodeKeyTuple(keySchema: Schema, keyTuple: unknown[]) {
  const decodedKeys = keyTuple.map((key, index) => {
    const schemaType = keySchema.staticFields[index] as StaticSchemaType;
    const byteLength = getStaticByteLength(schemaType);
    const bytes = hexToArray(key as string);
    // Key data is padded, so need offset
    const offset = bytes.length - byteLength;
    return decodeStaticField(keySchema.staticFields[index] as StaticSchemaType, bytes, offset);
  });
  return decodedKeys.reduce<Record<number, unknown>>((acc, curr, i) => ({ ...acc, [i]: curr }), {});
}
