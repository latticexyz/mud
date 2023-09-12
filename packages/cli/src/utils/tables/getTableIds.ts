import { StoreConfig } from "@latticexyz/store";
import { toResourceSelector } from "../utils";
import { TableIds } from "./types";

export function getTableIds(storeConfig: StoreConfig): TableIds {
  const tableIds: TableIds = {};
  for (const [tableName, { name }] of Object.entries(storeConfig.tables)) {
    tableIds[tableName] = toResourceSelector(storeConfig.namespace, name);
  }
  return tableIds;
}
