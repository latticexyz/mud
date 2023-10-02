import { CallData } from "../utils/types";

export function getBatchCallCallData(input: { systemId: string; batchCallData: string[] }): CallData {
  const { systemId, batchCallData } = input;
  const extendedBatchCallData = [];
  for (const calldata of batchCallData) {
    extendedBatchCallData.push([systemId, calldata]);
  }
  return {
    func: "batchCall",
    args: [extendedBatchCallData],
  };
}
