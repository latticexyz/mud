import { Hex } from "viem";
import ecoji from "o-ecoji-js";

export function encodeSignature(signature: Hex): string {
  return ecoji.encode(signature);
}
