import { QueryLayerClient } from "@latticexyz/services/protobuf/ts/mode/mode";
import { getBlockNumberFromModeTable } from "./getBlockNumberFromModeTable";

export async function getModeBlockNumber(client: QueryLayerClient, chainId: number): Promise<number> {
  const response = await client.find({
    from: "block_number",
    namespace: {
      chainId: chainId.toString(),
    },
  });
  console.log("getModeBlockNumber response", response);
  const blockNumber = getBlockNumberFromModeTable(response.tables["block_number"]);
  console.log("MODE block number", blockNumber);
  return blockNumber;
}
