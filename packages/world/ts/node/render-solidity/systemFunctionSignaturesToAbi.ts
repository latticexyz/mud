import { Abi, parseAbiItem } from "viem";

export function systemFunctionSignaturesToAbi(systemFunctionSignatures: readonly string[]): Abi {
  const abi = systemFunctionSignatures.map((systemFunctionSignature) => {
    const formattedSignature = "function " + systemFunctionSignature;
    return parseAbiItem(formattedSignature);
  });

  return abi;
}
