import { Client, Transport, Chain, Account, Address } from "viem";
import { Table } from "./configToTables";

export async function getTables(
  client: Client<Transport, Chain | undefined, Account>,
  worldAddress: Address
): Promise<Table[]> {
  return [];
}
