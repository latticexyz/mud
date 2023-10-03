import { getFunctionSignature } from "viem";
import { getContractData } from "../utils/getContractData";
import { isDefined } from "@latticexyz/common/utils";

export function loadFunctionSignatures(contractName: string, forgeOutDirectory: string): string[] {
  const { abi } = getContractData(contractName, forgeOutDirectory);
  return abi
    .map((item) => {
      if (item.type === "function") {
        return getFunctionSignature(item);
      }
      if (item.type === "fallback") {
        return "fallback()";
      }
    })
    .filter(isDefined);
}
