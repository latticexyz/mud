import { SchemaTypeToAbiType } from "@latticexyz/schema-type";
import { Schema } from "../common";
import { decodeAbiParameters } from "viem";

export function decodeKeyTuple(keySchema: Schema, keyTuple: unknown[]) {
  const abiTypes = keySchema.staticFields.map((schemaType) => SchemaTypeToAbiType[schemaType]);
  const decodedKeys = keyTuple.map(
    (key, index) => decodeAbiParameters([{ type: abiTypes[index] }], key as `0x${string}`)[0]
  );
  return decodedKeys.reduce<Record<number, unknown>>((acc, curr, i) => ({ ...acc, [i]: curr }), {});
}
