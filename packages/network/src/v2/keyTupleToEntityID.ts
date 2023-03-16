import { EntityID } from "@latticexyz/recs";
import { normalizeEntityID } from "../utils";

// TODO: revisit key tuple format?
export function keyTupleToEntityID(keyTuple: any[]): EntityID {
  return normalizeEntityID(keyTuple.join(":"));
}
