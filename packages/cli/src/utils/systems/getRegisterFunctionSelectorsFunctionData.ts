import { resourceIdToHex } from "@latticexyz/common";
import { System } from "./types";
import { loadFunctionSignatures, toFunctionSelector } from "./utils";
import { ethers } from "ethers";

export function getRegisterFunctionSelectorsFunctionData(input: {
  systemContractName: string;
  system: System;
  namespace: string;
  forgeOutDirectory: string;
  contract: ethers.Contract;
}): string[] {
  // Register system at route
  const callData: string[] = [];
  const { systemContractName, namespace, forgeOutDirectory, system, contract } = input;

  if (system.registerFunctionSelectors) {
    const baseSystemFunctionSignatures = loadFunctionSignatures("System", forgeOutDirectory);
    const systemFunctionSignatures = loadFunctionSignatures(systemContractName, forgeOutDirectory).filter(
      (functionSignature) =>
        systemContractName === "System" || !baseSystemFunctionSignatures.includes(functionSignature)
    );
    const isRoot = namespace === "";
    for (const systemFunctionSignature of systemFunctionSignatures) {
      callData.push(
        getRegisterFunctionSelectorFunctionData({
          namespace,
          name: system.name,
          systemFunctionSignature,
          isRoot,
          contract: contract,
        })
      );
    }
  }
  return callData;
}

function getRegisterFunctionSelectorFunctionData(input: {
  namespace: string;
  name: string;
  systemFunctionSignature: string;
  isRoot: boolean;
  contract: ethers.Contract;
}): string {
  const { namespace, name, systemFunctionSignature, isRoot, contract } = input;
  const systemId = resourceIdToHex({ type: "system", namespace, name });
  if (isRoot) {
    const functionSelector = toFunctionSelector(systemFunctionSignature);
    const functionData = contract.interface.encodeFunctionData("registerRootFunctionSelector", [
      systemId,
      systemFunctionSignature,
      functionSelector,
    ]);
    return functionData;
  } else {
    const functionData = contract.interface.encodeFunctionData("registerFunctionSelector", [
      systemId,
      systemFunctionSignature,
    ]);
    return functionData;
  }
}
