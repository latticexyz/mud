import { BigNumber } from "ethers";
import { keccak256 as keccak256Bytes, toUtf8Bytes } from "ethers/lib/utils";

/**
 * Compute keccak256 hash from given string and remove padding from the resulting hex string
 * @param data String to be hashed
 * @returns Hash of the given string as hex string without padding
 */
export function keccak256(data: string) {
  return BigNumber.from(keccak256Bytes(toUtf8Bytes(data))).toHexString();
}
