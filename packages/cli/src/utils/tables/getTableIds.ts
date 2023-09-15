import { StoreConfig } from "@latticexyz/store";
import { TableIds } from "./types";
import { toBytes16 } from "../utils/toBytes16";

export function getTableIds(storeConfig: StoreConfig): TableIds {
  const tableIds: TableIds = {};
  for (const [tableName, { name }] of Object.entries(storeConfig.tables)) {
    tableIds[tableName] = toResourceSelector(storeConfig.namespace, name);
  }
  return tableIds;
}

// (see https://github.com/latticexyz/mud/issues/499)
function toResourceSelector(namespace: string, file: string): Uint8Array {
  const namespaceBytes = toBytes16(namespace);
  const fileBytes = toBytes16(file);
  const result = new Uint8Array(32);
  result.set(namespaceBytes);
  result.set(fileBytes, 16);
  return result;
}
