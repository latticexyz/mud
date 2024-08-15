import { AbiItem, parseAbiItem } from "viem";

export function functionSignatureToAbiItem(functionSignature: string): AbiItem {
  const formattedSignature = `function ${functionSignature}`;
  return parseAbiItem(formattedSignature);
}
