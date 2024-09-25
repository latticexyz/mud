import { Hex } from "viem";
import { snakeCase } from "../../../utils";
import { DeployedTable } from "../api/utils/decodeTable";
import { indexerForChainId } from "./indexerForChainId";

export function constructTableName(deployedTable: DeployedTable, worldAddress: Hex, chainId: number) {
  const indexer = indexerForChainId(chainId);
  let tableId = deployedTable.name;
  if (deployedTable.namespace) {
    tableId = `${deployedTable.namespace}${indexer.type === "sqlite" ? "_" : "__"}${tableId}`;
  }
  return indexer.type === "sqlite" ? `${worldAddress}__${snakeCase(tableId)}`.toLowerCase() : tableId;
}
