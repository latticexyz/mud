import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { getTableName } from "@latticexyz/store-sync/sqlite";
import { indexerForChainId } from "./indexerForChainId";

export function constructTableName(table: Table, worldAddress: Hex, chainId: number) {
  const indexer = indexerForChainId(chainId);
  return indexer.type === "sqlite" ? constructSqliteTableName(table, worldAddress) : constructDozerTableName(table);
}

function constructSqliteTableName(table: Table, worldAddress: Hex) {
  return getTableName(worldAddress, table.namespace, table.name);
}

function constructDozerTableName(table: Table) {
  return table.namespace ? `${table.namespace}__${table.name}` : table.name;
}
