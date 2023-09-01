import { getAddress } from "viem";
import { Table } from "../common";

export function getTableKey(table: Pick<Table, "address" | "namespace" | "name">): string {
  return `${getAddress(table.address)}:${table.namespace}:${table.name}`;
}
