import { Hex } from "viem";

/**
 * Get the hex value at start/end positions. This will always return a valid hex string.
 *
 * If `start` is out of range, this returns `"0x"`.
 *
 * If `end` is specified and out of range, the result is right zero-padded to the desired length (`end - start`).
 */
export function readHex(data: Hex, start: number, end?: number): Hex {
  return `0x${data
    .replace(/^0x/, "")
    .slice(start * 2, end != null ? end * 2 : undefined)
    .padEnd(((end ?? start) - start) * 2, "0")}`;
}
