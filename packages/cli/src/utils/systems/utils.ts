import { ethers } from "ethers";
import { ParamType } from "ethers/lib/utils.js";
import { getContractData } from "../txHelpers";
import { FunctionSignature } from "./types";

export function loadFunctionSignatures(contractName: string, forgeOutDirectory: string): FunctionSignature[] {
  const { abi } = getContractData(contractName, forgeOutDirectory);

  return abi
    .filter((item) => ["fallback", "function"].includes(item.type))
    .map((item) => {
      if (item.type === "fallback") return { functionName: "", functionArgs: "" };

      return {
        functionName: item.name,
        functionArgs: parseComponents(item.inputs),
      };
    });
}

// TODO: move this to utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
export function toFunctionSelector({ functionName, functionArgs }: FunctionSignature): string {
  const functionSignature = functionName + functionArgs;
  if (functionSignature === "") return "0x";
  return sigHash(functionSignature);
}

/**
 * Recursively turn (nested) structs in signatures into tuples
 */
function parseComponents(params: ParamType[]): string {
  const components = params.map((param) => {
    const tupleMatch = param.type.match(/tuple(.*)/);
    if (tupleMatch) {
      // there can be arrays of tuples,
      // `tupleMatch[1]` preserves the array brackets (or is empty string for non-arrays)
      return parseComponents(param.components) + tupleMatch[1];
    } else {
      return param.type;
    }
  });
  return `(${components})`;
}

// TODO: move this to utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function sigHash(signature: string) {
  return ethers.utils.hexDataSlice(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)), 0, 4);
}
