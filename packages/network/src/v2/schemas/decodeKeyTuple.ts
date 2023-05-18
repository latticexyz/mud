import { Schema } from "../common";
import { decodeAbiParameters } from "viem";

export function decodeKeyTuple(keySchema: Schema, keyTuple: unknown[]) {
  if (keySchema.staticFields.length !== keyTuple.length) {
    throw new Error("keySchema's staticFields and keyTuple must have the same length");
  }
  const decodedKeys = keyTuple.map(
    (key, index) => decodeAbiParameters([{ type: keySchema.staticFields[index] }], key as `0x${string}`)[0]
  );
  return decodedKeys.reduce<Record<number, unknown>>((acc, curr, i) => ({ ...acc, [i]: curr }), {});
}
