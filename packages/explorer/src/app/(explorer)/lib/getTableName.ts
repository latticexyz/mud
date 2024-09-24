import { Hex } from "viem";
import { anvil } from "viem/chains";
import { DeployedTable } from "../api/utils/decodeTable";
import { snakeCase } from "./utils";

export function getTableName(deployedTable: DeployedTable, worldAddress: Hex, chainId: number) {
  let tableId = deployedTable.name;
  if (deployedTable.namespace) {
    tableId = `${deployedTable.namespace}${chainId === anvil.id ? "_" : "__"}${tableId}`;
  }

  return chainId === anvil.id ? `${worldAddress}__${snakeCase(tableId)}`.toLowerCase() : tableId;
}
