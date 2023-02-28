import { keccak256 as keccak256Bytes, toUtf8Bytes } from "ethers/lib/utils.js";
import { readFileSync } from "fs";

export const IDregex = new RegExp(/(?<=uint256 constant ID = uint256\(keccak256\(")(.*)(?="\))/);

export function extractIdFromFile(path: string): string | null {
  const content = readFileSync(path).toString();
  const regexResult = IDregex.exec(content);
  return regexResult && regexResult[0];
}

export function keccak256(data: string) {
  return keccak256Bytes(toUtf8Bytes(data));
}
