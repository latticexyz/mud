import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { snakeCase } from "../../../utils";
import { indexerForChainId } from "./indexerForChainId";

export function constructTableName(table: Table, worldAddress: Hex, chainId: number) {
  const indexer = indexerForChainId(chainId);
  let tableId = table.name;
  if (table.namespace) {
    tableId = `${table.namespace}${indexer.type === "sqlite" ? "_" : "__"}${tableId}`;
  }
  return indexer.type === "sqlite" ? `${worldAddress}__${snakeCase(tableId)}`.toLowerCase() : tableId;
}
