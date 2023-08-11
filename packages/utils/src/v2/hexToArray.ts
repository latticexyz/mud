import { isHex } from "./isHex";

// TODO: migrate to viem's toBytes(hex)
export const hexToArray = (hex: string): Uint8Array => {
  if (!isHex(hex)) {
    console.error("Invalid hex string", hex);
    throw new Error("Invalid hex string");
  }

  // Skip the "0x" prefix if present
  const start = hex.startsWith("0x") ? 2 : 0;

  // If there are no hex characters, return an empty array
  if (start === hex.length) return new Uint8Array([]);

  const result = new Uint8Array((hex.length - start) / 2);
  for (let i = start; i < hex.length; i += 2) {
    result[(i - start) / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  return result;
};
