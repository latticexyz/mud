import { Hex, concatHex, hexToBigInt, keccak256, toBytes, toHex } from "viem";

// TODO: move this util to MUD (equivalent of StoreCore._getStaticDataLocation)
const SLOT = hexToBigInt(keccak256(toBytes("mud.store")));
export function getStaticDataLocation(tableId: Hex, keyTuple: Hex[]): Hex {
  return toHex(SLOT ^ hexToBigInt(keccak256(concatHex([tableId, ...keyTuple]))));
}
