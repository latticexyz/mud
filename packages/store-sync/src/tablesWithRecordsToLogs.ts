import { StorageAdapterLog, TableWithRecords } from "./common";
import { encodeKey, encodeValueArgs } from "@latticexyz/protocol-parser";
import { tableToLog } from "./tableToLog";

/**
 * @internal
 */
export function tablesWithRecordsToLogs(tables: readonly TableWithRecords[]): StorageAdapterLog[] {
  return [
    ...tables.map(tableToLog),
    ...tables.flatMap((table) =>
      table.records.map(
        (record): StorageAdapterLog => ({
          eventName: "Store_SetRecord",
          address: table.address,
          args: {
            tableId: table.tableId,
            keyTuple: encodeKey(table.keySchema, record.key),
            ...encodeValueArgs(table.valueSchema, record.value),
          },
        })
      )
    ),
  ];
}
