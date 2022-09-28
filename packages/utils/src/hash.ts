import { BigNumber } from "ethers";
import { keccak256 as keccak256Bytes, toUtf8Bytes } from "ethers/lib/utils";
import { Coord } from "./types";

import { defaultAbiCoder as abi } from "ethers/lib/utils";

/**
 * Compute keccak256 hash from given string and remove padding from the resulting hex string
 * @param data String to be hashed
 * @returns Hash of the given string as hex string without padding
 */
export function keccak256(data: string) {
  return BigNumber.from(keccak256Bytes(toUtf8Bytes(data))).toHexString();
}

export function keccak256Coord(coord: Coord): string {
  // TODO: make faster by implementing in wasm
  const bytes = abi.encode(["int32", "int32"], [coord.x, coord.y]);
  return keccak256Bytes(bytes);
}
