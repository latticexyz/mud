import { tableIdToHex } from "@latticexyz/common";
import { CallData } from "../utils";
import { FunctionSignature, System } from "./types";
import { loadFunctionSignatures, toFunctionSelector } from "./utils";

export function registerFunctionCalls(input: {
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
        registerFunctionCall({ namespace, name: system.name, systemName, functionName, functionArgs, isRoot })
      );
    }
  }
  return callData;
}

function registerFunctionCall(input: {
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
      args: [tableIdToHex(namespace, name), worldFunctionSelector, systemFunctionSelector],
    };
  } else {
    return {
      func: "registerRootFunctionSelector",
      args: [tableIdToHex(namespace, name), functionName, functionArgs],
    };
  }
}
