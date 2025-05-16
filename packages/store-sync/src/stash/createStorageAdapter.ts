import { Stash, PendingStashUpdate, TableRecord, applyUpdates, getRecord } from "@latticexyz/stash/internal";
import {
  decodeKey,
  decodeValueArgs,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { hexToResource, spliceHex } from "@latticexyz/common";
import { Hex, concatHex, size } from "viem";
import { Table } from "@latticexyz/config";
import { StorageAdapter, StorageAdapterBlock, emptyValueArgs } from "../common";

export type CreateStorageAdapter = {
  stash: Stash;
};

export function createStorageAdapter({ stash }: CreateStorageAdapter): StorageAdapter {
  const tablesById = Object.fromEntries(
    Object.values(stash.get().config)
      .flatMap((namespace) => Object.values(namespace) as readonly Table[])
      .map((table) => [table.tableId, table]),
  );

  function getRecordId(tableId: Hex, keyTuple: readonly Hex[]): string {
    return `${tableId}:${concatHex(keyTuple)}`;
  }

  return async function storageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    const pendingRecords: Record<string, PendingStashUpdate> = {};
    const updates: PendingStashUpdate[] = [];

    for (const log of logs) {
      try {
        const table = tablesById[log.args.tableId];
        if (!table) continue;

        const id = getRecordId(log.args.tableId, log.args.keyTuple);

        const valueSchema = getSchemaTypes(getValueSchema(table));
        const keySchema = getSchemaTypes(getKeySchema(table));
        const key = decodeKey(keySchema, log.args.keyTuple);

        if (log.eventName === "Store_SetRecord") {
          const value = decodeValueArgs(valueSchema, log.args);
          updates.push((pendingRecords[id] = { table, key, value }));
        } else if (log.eventName === "Store_SpliceStaticData") {
          const previousValue = pendingRecords[id]
            ? pendingRecords[id].value
              ? ({ ...pendingRecords[id].key, ...pendingRecords[id].value } as TableRecord)
              : undefined
            : getRecord({ stash, table, key });

          const {
            staticData: previousStaticData,
            encodedLengths,
            dynamicData,
          } = previousValue ? encodeValueArgs(valueSchema, previousValue) : emptyValueArgs;

          const staticData = spliceHex(previousStaticData, log.args.start, size(log.args.data), log.args.data);
          const value = decodeValueArgs(valueSchema, {
            staticData,
            encodedLengths,
            dynamicData,
          });

          updates.push((pendingRecords[id] = { table, key, value }));
        } else if (log.eventName === "Store_SpliceDynamicData") {
          const previousValue = pendingRecords[id]
            ? ({ ...pendingRecords[id].key, ...pendingRecords[id].value } as TableRecord)
            : getRecord({ stash, table, key });

          const { staticData, dynamicData: previousDynamicData } = previousValue
            ? encodeValueArgs(valueSchema, previousValue)
            : emptyValueArgs;

          const dynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);
          const value = decodeValueArgs(valueSchema, {
            staticData,
            encodedLengths: log.args.encodedLengths,
            dynamicData,
          });

          updates.push((pendingRecords[id] = { table, key, value }));
        } else if (log.eventName === "Store_DeleteRecord") {
          updates.push((pendingRecords[id] = { table, key, value: undefined }));
        }
      } catch (e) {
        console.error("Error processing log", log, hexToResource(log.args.tableId));
        throw e;
      }
    }

    applyUpdates({ stash, updates });
  };
}
