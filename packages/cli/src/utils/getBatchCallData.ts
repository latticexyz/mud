import { resourceToHex } from "@latticexyz/common";
import { Hex } from "viem";

// Used to identify the core system in `batchCall`
const coreSystemId = resourceToHex({ type: "system", namespace: "", name: "core" });

export function getBatchCallData(encodedFunctionDataList: Hex[]): { systemId: Hex; callData: Hex }[] {
  const encodedFunctionDataListExtended = encodedFunctionDataList.map((encodedFunctionData) => {
    const encodedFunctionDataTmp: { systemId: Hex; callData: Hex } = {
      systemId: coreSystemId,
      callData: encodedFunctionData,
    };
    return encodedFunctionDataTmp;
  });
  return encodedFunctionDataListExtended;
}
