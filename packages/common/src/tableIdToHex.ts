import { Hex, stringToHex, concatHex } from "viem";

export function tableIdToHex(namespace: string, name: string): Hex {
  return concatHex([
    stringToHex(namespace.substring(0, 16), { size: 16 }),
    stringToHex(name.substring(0, 16), { size: 16 }),
  ]);
}
