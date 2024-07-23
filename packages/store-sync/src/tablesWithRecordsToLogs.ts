import { StorageAdapterLog, TableWithRecords } from "./common";
import {
  encodeKey,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
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
            // TODO: migrate away from these helpers
            keyTuple: encodeKey(getSchemaTypes(getKeySchema(table)) as never, record.key as never),
            ...encodeValueArgs(getSchemaTypes(getValueSchema(table)), record.value),
          },
        }),
      ),
    ),
  ];
}
