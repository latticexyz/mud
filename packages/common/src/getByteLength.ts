import { Hex } from "viem";

export function getByteLength(data: Hex): number {
  // Remove `0x` prefix, then byte is 2 characters
  return (data.length - 2) / 2;
}
