import { Entity } from "@latticexyz/recs";
import { Hex, sliceHex, size, isHex } from "viem";

export function entityToHexKeyTuple(entity: Entity): readonly Hex[] {
  if (!isHex(entity)) {
    throw new Error(`entity ${entity} is not a hex string`);
  }
  const length = size(entity);
  if (length % 32 !== 0) {
    throw new Error(`entity length ${length} is not a multiple of 32 bytes`);
  }
  return new Array(length / 32).fill(0).map((_, index) => sliceHex(entity, index * 32, (index + 1) * 32));
}
