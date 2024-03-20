import { StorageAdapter } from "../common";
import { QueryCacheStore, RawTableRecord, TableRecord } from "./createStore";
import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import { Hex, concatHex, size } from "viem";
import {
  KeySchema,
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { flattenSchema } from "../flattenSchema";
import debug from "debug";
import { Tables } from "./common";

function getRecordId({ tableId, keyTuple }: { tableId: Hex; keyTuple: readonly Hex[] }): string {
  return `${tableId}:${concatHex(keyTuple)}`;
}

export type CreateStorageAdapterOptions<store extends QueryCacheStore> = {
  store: store;
};

// TS isn't happy when we use the strongly typed store for the function definition so we
// overload the strongly typed variant here and allow the more generic version in the function.
export function createStorageAdapter<store extends QueryCacheStore>({
  store,
}: CreateStorageAdapterOptions<store>): StorageAdapter;

export function createStorageAdapter({ store }: CreateStorageAdapterOptions<QueryCacheStore<Tables>>): StorageAdapter {
  return async function queryCacheStorageAdapter({ logs }) {
    const touchedIds = new Set<string>();

    const { tables, rawRecords: previousRawRecords, records: previousRecords } = store.getState();
    const tableList = Object.values(tables);
    const updatedRawRecords: { [id: string]: RawTableRecord } = {};

    for (const log of logs) {
      const table = tableList.find((table) => table.tableId === log.args.tableId);
      if (!table) {
        const { namespace, name } = hexToResource(log.args.tableId);
        debug(
          `skipping update for unknown table: ${resourceToLabel({ namespace, name })} (${log.args.tableId}) at ${
            log.address
          }`,
        );
        continue;
      }

      const id = getRecordId(log.args);

      if (log.eventName === "Store_SetRecord") {
        // debug("setting record", { namespace: table.namespace, name: table.name, id, log });
        updatedRawRecords[id] = {
          id,
          table,
          keyTuple: log.args.keyTuple,
          staticData: log.args.staticData,
          encodedLengths: log.args.encodedLengths,
          dynamicData: log.args.dynamicData,
        };
        touchedIds.add(id);
      } else if (log.eventName === "Store_SpliceStaticData") {
        // debug("splicing static data", { namespace: table.namespace, name: table.name, id, log });
        const previousRecord =
          previousRawRecords.find((record) => record.id === id) ??
          ({
            id,
            table,
            keyTuple: log.args.keyTuple,
            staticData: "0x",
            encodedLengths: "0x",
            dynamicData: "0x",
          } satisfies RawTableRecord);
        const staticData = spliceHex(previousRecord.staticData, log.args.start, size(log.args.data), log.args.data);
        updatedRawRecords[id] = {
          ...previousRecord,
          staticData,
        };
        touchedIds.add(id);
      } else if (log.eventName === "Store_SpliceDynamicData") {
        // debug("splicing dynamic data", { namespace: table.namespace, name: table.name, id, log });
        const previousRecord =
          previousRawRecords.find((record) => record.id === id) ??
          ({
            id,
            table,
            keyTuple: log.args.keyTuple,
            staticData: "0x",
            encodedLengths: "0x",
            dynamicData: "0x",
          } satisfies RawTableRecord);
        const encodedLengths = log.args.encodedLengths;
        const dynamicData = spliceHex(previousRecord.dynamicData, log.args.start, log.args.deleteCount, log.args.data);
        updatedRawRecords[id] = {
          ...previousRecord,
          encodedLengths,
          dynamicData,
        };
        touchedIds.add(id);
      } else if (log.eventName === "Store_DeleteRecord") {
        // debug("deleting record", { namespace: table.namespace, name: table.name, id, log });
        delete updatedRawRecords[id];
        touchedIds.add(id);
      }
    }

    if (!touchedIds.size) return;

    const rawRecords: readonly RawTableRecord[] = [
      ...previousRawRecords.filter((record) => !touchedIds.has(record.id)),
      ...Object.values(updatedRawRecords),
    ];

    const records: readonly TableRecord[] = [
      ...previousRecords.filter((record) => !touchedIds.has(record.id)),
      ...Object.values(updatedRawRecords).map((rawRecord): TableRecord => {
        const keySchema = flattenSchema(getKeySchema(rawRecord.table));
        const key = decodeKey(keySchema as KeySchema, rawRecord.keyTuple);
        const value = decodeValueArgs(flattenSchema(getValueSchema(rawRecord.table)), rawRecord);

        return {
          table: rawRecord.table,
          id: rawRecord.id,
          keyTuple: rawRecord.keyTuple,
          // TODO: do something to make sure this stays ordered?
          primaryKey: Object.values(key),
          key,
          value,
          fields: { ...key, ...value },
        };
      }),
    ];

    store.setState({
      rawRecords,
      records,
    });
  };
}
