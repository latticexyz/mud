import { StaticPrimitiveType } from "@latticexyz/schema-type";
import { Hex, encodeAbiParameters } from "viem";
import { Schema } from "./common";

/** @deprecated use `encodeKey` instead */
export function encodeKeyTuple(keySchema: Schema, keyTuple: StaticPrimitiveType[]): Hex[] {
  return keyTuple.map((key, index) => encodeAbiParameters([{ type: keySchema.staticFields[index] }], [key]));
}
