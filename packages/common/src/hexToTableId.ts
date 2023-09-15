import { Hex, hexToString, sliceHex } from "viem";

export function hexToTableId(hex: Hex): { namespace: string; name: string } {
  const namespace = hexToString(sliceHex(hex, 0, 16)).replace(/\0+$/, "");
  const name = hexToString(sliceHex(hex, 16, 32)).replace(/\0+$/, "");

  return { namespace, name };
}
