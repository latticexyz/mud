import { Abi, parseAbiItem } from "viem";
import { DeployedSystem } from "../deploy/common";

export function systemToAbi(system: DeployedSystem): Abi {
  const abi = system.functions.map((func) => {
    const formattedSignature = `function ${func.systemFunctionSignature}`;
    return parseAbiItem(formattedSignature);
  });

  return abi;
}
