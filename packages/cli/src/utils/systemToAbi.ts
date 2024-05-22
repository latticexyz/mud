import { Abi, AbiItem, parseAbiItem } from "viem";
import { DeployedSystem } from "../deploy/common";

export function functionSignatureToAbiItem(functionSignature: string): AbiItem {
  const formattedSignature = `function ${functionSignature}`;
  return parseAbiItem(formattedSignature);
}

export function systemToAbi(system: DeployedSystem): Abi {
  const abi = system.functions.map((func) => {
    return functionSignatureToAbiItem(func.systemFunctionSignature);
  });

  return abi;
}
