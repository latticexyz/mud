import { QueryLayerClient } from "@latticexyz/services/protobuf/ts/mode/mode";
import { getBlockNumberFromModeTable } from "./getBlockNumberFromModeTable";

export async function getModeBlockNumber(client: QueryLayerClient, chainId: number): Promise<number> {
  const response = await client.getState({
    chainTables: ["block_number"],
    namespace: {
      chainId: chainId.toString(),
      worldAddress: "unknown",
    },
  });
  console.log("getModeBlockNumber response", response);
  const blockNumber = getBlockNumberFromModeTable(response.chainTables["block_number"]);
  console.log("MODE block number", blockNumber);
  return blockNumber;
}
