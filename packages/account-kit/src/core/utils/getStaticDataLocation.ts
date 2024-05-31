import { Hex, concatHex, hexToBigInt, keccak256, toBytes, toHex } from "viem";

// TODO: move this to store package or similar (equivalent of StoreCore._getStaticDataLocation)

const SLOT = hexToBigInt(keccak256(toBytes("mud.store")));

export function getStaticDataLocation(tableId: Hex, keyTuple: readonly Hex[]): Hex {
  return toHex(SLOT ^ hexToBigInt(keccak256(concatHex([tableId, ...keyTuple]))), { size: 32 });
}
