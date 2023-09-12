import { Hex, decodeAbiParameters } from "viem";
import { StaticPrimitiveType } from "@latticexyz/schema-type";
import { Schema } from "./common";

// key tuples are encoded in the same way as abi.encode, so we can decode them with viem

/** @deprecated use `decodeKey` instead */
export function decodeKeyTuple(keySchema: Schema, keyTuple: readonly Hex[]): StaticPrimitiveType[] {
  if (keySchema.staticFields.length !== keyTuple.length) {
    throw new Error(
      `key tuple length ${keyTuple.length} does not match key schema length ${keySchema.staticFields.length}`
    );
  }
  return keyTuple.map(
    (key, index) => decodeAbiParameters([{ type: keySchema.staticFields[index] }], key)[0] as StaticPrimitiveType
  );
}
