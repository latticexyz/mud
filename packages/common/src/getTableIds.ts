import { TableId } from "./TableId";

export function getTableIds(config: { namespace: string; tables: { [key: string]: unknown } }): TableId[] {
  return Object.keys(config.tables).map((table) => new TableId(config.namespace, table));
}
