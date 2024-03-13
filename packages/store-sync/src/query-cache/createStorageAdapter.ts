import { StorageAdapter } from "../common";
import { QueryCacheStore, RawTableRecord, TableRecord } from "./createStore";
import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import { size } from "viem";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";
import { flattenSchema } from "../flattenSchema";
import { getId } from "./getId";
import debug from "debug";
import { KeySchema } from "@latticexyz/store";
import { Tables } from "./common";

export type CreateStorageAdapterOptions<tables extends Tables> = {
  store: QueryCacheStore<tables>;
};

export function createStorageAdapter<tables extends Tables>({
  store,
}: CreateStorageAdapterOptions<tables>): StorageAdapter {
  return async function queryCacheStorageAdapter({ logs }) {
    const touchedIds = new Set<string>();

    const { tables, rawRecords: previousRawRecords, records: previousRecords } = store.getState();
    const updatedRawRecords: { [id: string]: RawTableRecord } = {};

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
        // TODO: figure out how to define this without casting
        const key = decodeKey(flattenSchema(rawRecord.table.keySchema as KeySchema), rawRecord.keyTuple) as TableRecord<
          tables[keyof tables]
        >["key"];

        // TODO: figure out how to define this without casting
        const value = decodeValueArgs(flattenSchema(rawRecord.table.valueSchema), rawRecord) as TableRecord<
          tables[keyof tables]
        >["value"];

        return {
          table: rawRecord.table,
          id: rawRecord.id,
          key,
          value,
          fields: { ...key, ...value },
        };
      }),
    ];

    store.setState({
      rawRecords: rawRecords as readonly RawTableRecord<tables[keyof tables]>[],
      records: records as readonly TableRecord<tables[keyof tables]>[],
    });
  };
}
