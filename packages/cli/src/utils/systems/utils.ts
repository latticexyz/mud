import { getContractData } from "../utils/getContractData";
import { AbiParameter } from "abitype";

type Param = AbiParameter & { components: any[] };

export function loadFunctionSignatures(contractName: string, forgeOutDirectory: string): string[] {
  const { abi } = getContractData(contractName, forgeOutDirectory);

  return abi
    .filter((item) => ["fallback", "function"].includes(item.type))
    .map((item) => {
      let name: string;
      let params: Param[];
      if (item.type === "function") {
        name = item.name;
        params = item.inputs as Param[];
      } else if (item.type === "fallback") {
        name = "fallback";
        params = [];
      } else throw Error(`Incorrect function type: ${item.type}`);

      return `${name}${parseComponents(params)}`;
    });
}

/**
 * Recursively turn (nested) structs in signatures into tuples
 */
function parseComponents(params: Param[]): string {
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
