import { Entity } from "@latticexyz/recs";
import { normalizeEntityID } from "../utils";
import { SingletonID } from "../workers";

// TODO: revisit key tuple format?
export function keyTupleToEntityID(keyTuple: any[]): Entity {
  // v2 uses an empty key tuple as the singleton ID, so we'll return the corresponding v1 singleton entity ID to normalize this for now
  if (keyTuple.length === 0) {
    return SingletonID;
  }
  return normalizeEntityID(keyTuple.join(":"));
}
