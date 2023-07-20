import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";

export function hexKeyTupleToEntity(hexKeyTuple: readonly Hex[]): Entity {
  return `entity:${hexKeyTuple.join(":")}` as Entity;
}
