import { resourceIdToHex } from "@latticexyz/common";
import { System } from "./types";
import { loadFunctionSignatures, toFunctionSelector } from "./utils";
import { CallData } from "../utils/types";

export function getRegisterFunctionSelectorsCallData(input: {
  systemName: string;
  system: System;
  namespace: string;
  forgeOutDirectory: string;
}): CallData[] {
  // Register system at route
  const callData: CallData[] = [];
  const { systemName, namespace, forgeOutDirectory, system } = input;

  if (system.registerFunctionSelectors) {
    const baseSystemFunctionNames = loadFunctionSignatures("System", forgeOutDirectory).map((sig) => sig.functionName);
    const functionSignatures = loadFunctionSignatures(systemName, forgeOutDirectory).filter(
      (sig) => systemName === "System" || !baseSystemFunctionNames.includes(sig.functionName)
    );
    const isRoot = namespace === "";
    for (const { functionName, functionArgs } of functionSignatures) {
      callData.push(
        getRegisterFunctionSelectorCallData({
          namespace,
          name: system.name,
          systemName,
          functionName,
          functionArgs,
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
  systemName: string;
  functionName: string;
  functionArgs: string;
  isRoot: boolean;
}): CallData {
  const { namespace, name, systemName, functionName, functionArgs, isRoot } = input;
  const functionSignature = isRoot
    ? functionName + functionArgs
    : `${namespace}_${name}_${functionName}${functionArgs}`;

  if (isRoot) {
    const worldFunctionSelector = toFunctionSelector(
      functionSignature === ""
        ? { functionName: systemName, functionArgs } // Register the system's fallback function as `<systemName>(<args>)`
        : { functionName, functionArgs }
    );
    const systemFunctionSelector = toFunctionSelector({ functionName, functionArgs });
    return {
      func: "registerRootFunctionSelector",
      args: [resourceIdToHex({ type: "system", namespace, name }), worldFunctionSelector, systemFunctionSelector],
    };
  } else {
    return {
      func: "registerRootFunctionSelector",
      args: [resourceIdToHex({ type: "system", namespace, name }), functionName, functionArgs],
    };
  }
}
