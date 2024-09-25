import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { snakeCase } from "../../../utils";
import { indexerForChainId } from "./indexerForChainId";

export function constructTableName(tableConfig: Table, worldAddress: Hex, chainId: number) {
  const indexer = indexerForChainId(chainId);
  let tableId = tableConfig.name;
  if (tableConfig.namespace) {
    tableId = `${tableConfig.namespace}${indexer.type === "sqlite" ? "_" : "__"}${tableId}`;
  }
  return indexer.type === "sqlite" ? `${worldAddress}__${snakeCase(tableId)}`.toLowerCase() : tableId;
}
