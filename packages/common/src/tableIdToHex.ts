import { Hex, stringToHex, concatHex } from "viem";

// TODO: rename to `resourceIdToHex` or `resourceSelectorToHex` since it can be used with other resources than tables
export function tableIdToHex(namespace: string, name: string): Hex {
  return concatHex([
    stringToHex(namespace.substring(0, 16), { size: 16 }),
    stringToHex(name.substring(0, 16), { size: 16 }),
  ]);
}
