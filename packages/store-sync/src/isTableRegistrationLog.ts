import { StorageAdapterLog, schemasTableId } from "./common";

export function isTableRegistrationLog(
  log: StorageAdapterLog
): log is StorageAdapterLog & { eventName: "StoreSetRecord" } {
  return log.eventName === "StoreSetRecord" && log.args.tableId === schemasTableId;
}
