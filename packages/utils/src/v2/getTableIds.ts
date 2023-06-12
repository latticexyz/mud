import { TableId } from "./TableId";

const STORE_SELECTOR_MAX_LENGTH = 16;

export function getTableIds(config: { namespace: string; tables: { [key: string]: unknown } }) {
  return Object.keys(config.tables).map(
    (table) =>
      new TableId(config.namespace.slice(0, STORE_SELECTOR_MAX_LENGTH), table.slice(0, STORE_SELECTOR_MAX_LENGTH))
  );
}
