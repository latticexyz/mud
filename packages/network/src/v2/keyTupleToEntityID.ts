import { Entity } from "@latticexyz/recs";
import { SingletonID } from "../workers";
import { toHex } from "viem";

// TODO: revisit key tuple format?
export function keyTupleToEntityID(keyTuple: any[]): Entity {
  // v2 uses an empty key tuple as the singleton ID, so we'll return the corresponding v1 singleton entity ID to normalize this for now
  if (keyTuple.length === 0) {
    return toHex(SingletonID, { size: 32 }) as Entity;
  }
  // TODO: this should probably be padded based on key schema (uint vs bytes32 will have different leading/trailing zeroes)
  return keyTuple.map((key) => toHex(key, { size: 32 })).join(":") as Entity;
}
