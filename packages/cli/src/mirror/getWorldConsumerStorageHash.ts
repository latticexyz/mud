import { Hex, concatHex, keccak256, stringToHex, toRlp } from "viem";

// keep aligned with StoreSwitch.sol
export const storeSwitchSlot = keccak256(stringToHex("mud.store.storage.StoreSwitch"));

export function getWorldConsumerStorageHash(worldAddress: Hex) {
  const path = concatHex(["0x20", keccak256(storeSwitchSlot)]);
  const leaf = toRlp([path, toRlp(worldAddress)]);
  return keccak256(leaf);
}
