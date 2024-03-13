import { StorageAdapter } from "../common";
import { QueryCacheStore, RawTableRecord, TableRecord } from "./createStore";
import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import { size } from "viem";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";
import { flattenSchema } from "../flattenSchema";
import { ResolvedTableConfig } from "@latticexyz/store/config/v2";
import { getId } from "./getId";
import debug from "debug";
import { KeySchema } from "@latticexyz/store";

export type CreateStorageAdapterOptions<table extends ResolvedTableConfig> = {
  store: QueryCacheStore<table>;
};

export function createStorageAdapter<table extends ResolvedTableConfig>({
  store,
}: CreateStorageAdapterOptions<table>): StorageAdapter {
  return async function queryCacheStorageAdapter({ logs }) {
    const touchedIds = new Set<string>();

    const { tables, rawRecords: previousRawRecords, records: previousRecords } = store.getState();
    const updatedRawRecords: { [id: string]: RawTableRecord<table> } = {};

    for (const log of logs) {
      const table = tables[log.args.tableId];
      if (!table) {
        const { namespace, name } = hexToResource(log.args.tableId);
        debug(
          `skipping update for unknown table: ${resourceToLabel({ namespace, name })} (${log.args.tableId}) at ${
            log.address
          }`,
        );
        continue;
      }

      const id = getId(log.args);

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
          } satisfies RawTableRecord<table>);
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
          } satisfies RawTableRecord<table>);
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

    const rawRecords: typeof previousRawRecords = [
      ...previousRawRecords.filter((record) => !touchedIds.has(record.id)),
      ...Object.values(updatedRawRecords),
    ];

    const records: typeof previousRecords = [
      ...previousRecords.filter((record) => !touchedIds.has(record.id)),
      ...Object.values(updatedRawRecords).map((rawRecord): TableRecord<table> => {
        // TODO: figure out how to define this without casting
        const key = decodeKey(
          flattenSchema(rawRecord.table.keySchema as KeySchema),
          rawRecord.keyTuple,
        ) as TableRecord<table>["key"];

        // TODO: figure out how to define this without casting
        const value = decodeValueArgs(
          flattenSchema(rawRecord.table.valueSchema),
          rawRecord,
        ) as TableRecord<table>["value"];

        return {
          table: rawRecord.table,
          id: rawRecord.id,
          key,
          value,
          fields: { ...key, ...value },
        };
      }),
    ];

    store.setState({ rawRecords: Object.values(rawRecords), records });
  };
}
