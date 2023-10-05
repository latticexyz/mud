import { Client, Transport, Chain, Account, Address, Hex } from "viem";
import { Table } from "./configToTables";
import { Resource, hexToResource } from "@latticexyz/common";

export async function getTables(
  client: Client<Transport, Chain | undefined, Account>,
  worldAddress: Address,
  resourceIds: Hex[]
): Promise<Table[]> {
  const tableResources = resourceIds
    .map(hexToResource)
    .filter((resource) => resource.type === "table" || resource.type === "offchainTable");

  return [];
}
