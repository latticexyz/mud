import { decodeValueArgs } from "@latticexyz/protocol-parser";
import { storeTables, worldAbi } from "./common";
import { Address, Client, Hex } from "viem";
import { readContract } from "viem/actions";

export async function hasResource(client: Client, worldAddress: Address, resourceId: Hex): Promise<boolean> {
  const [staticData, encodedLengths, dynamicData] = await readContract(client, {
    address: worldAddress,
    abi: worldAbi,
    functionName: "getRecord",
    args: [storeTables.store_ResourceIds.tableId, [resourceId]],
  });
  const { exists } = decodeValueArgs(storeTables.store_ResourceIds.valueSchema, {
    staticData,
    encodedLengths,
    dynamicData,
  });
  return exists;
}
