import { ParamType } from "ethers/lib/utils.js";
import { getContractData } from "../utils/getContractData";

export function loadFunctionSignatures(contractName: string, forgeOutDirectory: string): string[] {
  const { abi } = getContractData(contractName, forgeOutDirectory);

  return abi
    .filter((item) => ["fallback", "function"].includes(item.type))
    .map((item) => {
      return `${item.name}${parseComponents(item.inputs)}`;
    });
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
