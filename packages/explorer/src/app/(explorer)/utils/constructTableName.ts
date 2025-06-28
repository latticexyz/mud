import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { getTableName } from "@latticexyz/store-sync/sqlite";

export function constructTableName(table: Table, worldAddress: Hex, indexerType: "sqlite" | "hosted") {
  return indexerType === "sqlite" ? constructSqliteTableName(table, worldAddress) : constructDozerTableName(table);
}

function constructSqliteTableName(table: Table, worldAddress: Hex) {
  return getTableName(worldAddress, table.namespace, table.name);
}

function constructDozerTableName(table: Table) {
  return table.namespace ? `${table.namespace}__${table.name}` : table.name;
}
