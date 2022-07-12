import { keccak256 as keccak256Bytes, toUtf8Bytes } from "ethers/lib/utils";

export function keccak256(data: string) {
  return keccak256Bytes(toUtf8Bytes(data));
}
