import { StorageAdapterLog, schemasTable } from "./common";

/**
 * @internal
 */
export function isTableRegistrationLog(
  log: StorageAdapterLog,
): log is Extract<StorageAdapterLog, { eventName: "Store_SetRecord" }> {
  return log.eventName === "Store_SetRecord" && log.args.tableId === schemasTable.tableId;
}
