import { Stash, PendingStashUpdate, TableRecord, getRecord, Key } from "@latticexyz/stash/internal";
import {
  decodeKey,
  decodeValueArgs,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { spliceHex } from "@latticexyz/common";
import { Hex, concatHex, size } from "viem";
import { Table } from "@latticexyz/config";
import { StorageAdapterBlock, emptyValueArgs } from "../common";
import { debug } from "./debug";

export function computeUpdates({
  stash,
  block,
}: {
  stash: Stash;
  block: StorageAdapterBlock;
}): readonly PendingStashUpdate[] {
  const tablesById = Object.fromEntries(
    Object.values(stash.get().config)
      .flatMap((namespace) => Object.values(namespace) as readonly Table[])
      .map((table) => [table.tableId, table]),
  );

  function getRecordId(tableId: Hex, keyTuple: readonly Hex[]): string {
    return `${tableId}:${concatHex(keyTuple)}`;
  }

  const pendingRecords: Record<string, PendingStashUpdate> = {};
  const updates: PendingStashUpdate[] = [];

  function getPendingRecord(id: string, table: Table, key: Key<Table>): TableRecord | undefined {
    return pendingRecords[id]
      ? pendingRecords[id].value
        ? ({ ...pendingRecords[id].key, ...pendingRecords[id].value } as TableRecord)
        : undefined
      : getRecord({ stash, table, key });
  }

  for (const log of block.logs) {
    const table = tablesById[log.args.tableId];
    if (!table) continue;

    const id = getRecordId(log.args.tableId, log.args.keyTuple);

    const valueSchema = getSchemaTypes(getValueSchema(table));
    const keySchema = getSchemaTypes(getKeySchema(table));
    const keyTupleLength = log.args.keyTuple.length;
    const keySchemaLength = Object.keys(keySchema).length;
    if (keySchemaLength !== keyTupleLength) {
      debug(`key tuple length ${keyTupleLength} does not match key schema length ${keySchemaLength}, skipping log`, {
        table,
        log,
      });
      continue;
    }
    const key = decodeKey(keySchema, log.args.keyTuple);

    if (log.eventName === "Store_SetRecord") {
      const value = decodeValueArgs(valueSchema, log.args);
      updates.push((pendingRecords[id] = { table, key, value }));
    } else if (log.eventName === "Store_SpliceStaticData") {
      const previousValue = getPendingRecord(id, table, key);
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
      const previousValue = getPendingRecord(id, table, key);
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
  }

  return updates;
}
