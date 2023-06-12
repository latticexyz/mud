import { Hex } from "viem";

export function truncateHex(hex: Hex) {
  return hex.replace(/^(0x[0-9A-F]{3})[0-9A-F]+([0-9A-F]{4})$/i, "$1…$2");
}
