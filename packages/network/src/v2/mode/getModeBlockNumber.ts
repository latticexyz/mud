import { QueryLayerClient } from "@latticexyz/services/mode";
import { getBlockNumberFromModeTable } from "./getBlockNumberFromModeTable";

export async function getModeBlockNumber(client: QueryLayerClient, chainId: number): Promise<number> {
  try {
    const response = await client.getPartialState({
      table: "block_number",
      namespace: {
        chainId: chainId.toString(),
      },
    });
    console.log("response", JSON.stringify(response));
    const blockNumber = getBlockNumberFromModeTable(response.chainTables["block_number"]);
    return blockNumber;
  } catch (e) {
    console.error("MODE Error: ", e);
    return -1;
  }
}
