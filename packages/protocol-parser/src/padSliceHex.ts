import { Hex } from "viem";

export function padSliceHex(data: Hex, start: number, end?: number): Hex {
  return `0x${data
    .replace(/^0x/, "")
    .slice(start * 2, end != null ? end * 2 : undefined)
    .padEnd(((end ?? start) - start) * 2, "0")}`;
}
