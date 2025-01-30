import { Hex } from "viem";
import { snakeCase } from "change-case";
import { Table } from "@latticexyz/config";
import { indexerForChainId } from "./indexerForChainId";

export function constructTableName(table: Table, worldAddress: Hex, chainId: number) {
  const indexer = indexerForChainId(chainId);
  return indexer.type === "sqlite" ? constructSqliteTableName(table, worldAddress) : constructDozerTableName(table);
}

function constructSqliteTableName(table: Table, worldAddress: Hex) {
  return `${worldAddress}__${snakeCase(table.namespace)}__${snakeCase(table.name)}`;
}

function constructDozerTableName(table: Table) {
  return table.namespace ? `${table.namespace}__${table.name}` : table.name;
}
