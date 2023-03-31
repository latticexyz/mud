import { QueryLayerClient } from "@latticexyz/services/protobuf/ts/mode/mode";
import { getBlockNumberFromModeTable } from "./getBlockNumberFromModeTable";

export async function getModeBlockNumber(client: QueryLayerClient, chainId: number): Promise<number> {
  try {
    const response = await client.single__GetState({
      table: "block_number",
      namespace: {
        chainId: chainId.toString(),
      },
    });
    const blockNumber = getBlockNumberFromModeTable(response.chainTables["block_number"]);
    return blockNumber;
  } catch (e) {
    console.error("MODE Error: ", e);
    return -1;
  }
}
