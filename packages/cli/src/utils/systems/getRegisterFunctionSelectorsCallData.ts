import { resourceIdToHex } from "@latticexyz/common";
import { System } from "./types";
import { loadFunctionSignatures, toFunctionSelector } from "./utils";
import { CallData } from "../utils/types";

export function getRegisterFunctionSelectorsCallData(input: {
  systemContractName: string;
  system: System;
  namespace: string;
  forgeOutDirectory: string;
}): CallData[] {
  // Register system at route
  const callData: CallData[] = [];
  const { systemContractName, namespace, forgeOutDirectory, system } = input;

  if (system.registerFunctionSelectors) {
    const baseSystemFunctionSignatures = loadFunctionSignatures("System", forgeOutDirectory);
    const systemFunctionSignatures = loadFunctionSignatures(systemContractName, forgeOutDirectory).filter(
      (functionSignature) =>
        systemContractName === "System" || !baseSystemFunctionSignatures.includes(functionSignature)
    );
    const isRoot = namespace === "";
    for (const systemFunctionSignature of systemFunctionSignatures) {
      callData.push(
        getRegisterFunctionSelectorCallData({
          namespace,
          name: system.name,
          systemFunctionSignature,
          isRoot,
        })
      );
    }
  }
  return callData;
}

function getRegisterFunctionSelectorCallData(input: {
  namespace: string;
  name: string;
  systemFunctionSignature: string;
  isRoot: boolean;
}): CallData {
  const { namespace, name, systemFunctionSignature, isRoot } = input;

  if (isRoot) {
    const functionSelector = toFunctionSelector(systemFunctionSignature);
    return {
      func: "registerRootFunctionSelector",
      args: [resourceIdToHex({ type: "system", namespace, name }), functionSelector, functionSelector],
    };
  } else {
    return {
      func: "registerFunctionSelector",
      args: [resourceIdToHex({ type: "system", namespace, name }), systemFunctionSignature],
    };
  }
}
