import { Hex } from "viem";
import ecoji from "o-ecoji-js";

export function decodeSignature(encodedSignature: string): Hex {
  return ecoji.decode(encodedSignature) as Hex;
}
