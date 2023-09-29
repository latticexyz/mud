import { StoreConfig } from "@latticexyz/store";
import { TableIds } from "./types";
import { resourceIdToHex } from "@latticexyz/common";
import { hexToBytes } from "viem";

export function getTableIds(storeConfig: StoreConfig): TableIds {
  const tableIds: TableIds = {};
  for (const [tableName, { name, offchainOnly }] of Object.entries(storeConfig.tables)) {
    tableIds[tableName] = hexToBytes(
      resourceIdToHex({
        type: offchainOnly ? "offchainTable" : "table",
        namespace: storeConfig.namespace,
        name,
      })
    );
  }
  return tableIds;
}
