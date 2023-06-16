import { Schema } from "./common";
import { Hex, decodeAbiParameters } from "viem";
import { StaticPrimitiveType } from "./staticAbiTypes";

// key tuples are encoded in the same way as abi.encode, so we can decode them with viem

export function decodeKeyTuple(keySchema: Schema, keyTuple: Hex[]): StaticPrimitiveType[] {
  return keyTuple.map(
    (key, index) => decodeAbiParameters([{ type: keySchema.staticFields[index] }], key)[0] as StaticPrimitiveType
  );
}
