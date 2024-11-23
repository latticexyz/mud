import { Hex, concatHex, hexToBigInt, keccak256, numberToHex, toBytes } from "viem";

// TODO: move to protocol-parser?
// equivalent of StoreCore._getStaticDataLocation

const SLOT = hexToBigInt(keccak256(toBytes("mud.store")));

export function getStaticDataLocation(tableId: Hex, keyTuple: readonly Hex[]): Hex {
  return numberToHex(SLOT ^ hexToBigInt(keccak256(concatHex([tableId, ...keyTuple]))), { size: 32 });
}
