import { Address, getAddress } from "viem";
import { Table, TableName, TableNamespace } from "../common";

export type TableKey = `${Address}:${TableNamespace}:${TableName}`;

export function getTableKey(table: Pick<Table, "address" | "namespace" | "name">): TableKey {
  return `${getAddress(table.address)}:${table.namespace}:${table.name}`;
}
