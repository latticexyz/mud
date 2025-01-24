import { AbiFunction, parseAbiItem } from "viem";

export function functionSignatureToAbiItem(functionSignature: string): AbiFunction {
  const formattedSignature = `function ${functionSignature}`;
  const abiItem = parseAbiItem(formattedSignature);

  if (abiItem.type !== "function") {
    throw new Error(`Expected function signature, got ${abiItem.type}`);
  }

  return abiItem;
}
