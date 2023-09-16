import { Hex, concatHex } from "viem";
import { readHex } from "./readHex";

export function spliceHex(data: Hex, start: number, deleteCount = 0, newData: Hex = "0x"): Hex {
  return concatHex([readHex(data, 0, start), newData, readHex(data, start + deleteCount)]);
}
