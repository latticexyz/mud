import { Table } from "./configToTables";

export function tableToLabel(table: Table): string {
  return `${table.namespace}:${table.name}`;
}
