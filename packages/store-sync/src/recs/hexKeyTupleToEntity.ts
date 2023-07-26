import { Entity } from "@latticexyz/recs";
import { Hex, concatHex } from "viem";

export function hexKeyTupleToEntity(hexKeyTuple: readonly Hex[]): Entity {
  return concatHex(hexKeyTuple as Hex[]) as Entity;
}
