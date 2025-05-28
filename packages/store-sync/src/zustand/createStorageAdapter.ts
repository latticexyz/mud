import { StorageAdapter } from "../common";
import { RawRecord, TableRecord } from "./common";
import { ZustandStore } from "./createStore";
import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import { debug } from "./debug";
import { getId } from "./getId";
import { size } from "viem";
import {
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { isDefined } from "@latticexyz/common/utils";
import { Tables } from "@latticexyz/config";

export type CreateStorageAdapterOptions<tables extends Tables> = {
  store: ZustandStore<tables>;
};

export function createStorageAdapter<tables extends Tables>({
  store,
}: CreateStorageAdapterOptions<tables>): StorageAdapter {
  return async function zustandStorageAdapter({ logs }) {
    // record id => is deleted
    const touchedIds: Map<string, boolean> = new Map();

    const rawRecords = { ...store.getState().rawRecords };

    for (const log of logs) {
      const table = store.getState().tables[log.args.tableId];
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
        debug("setting record", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        rawRecords[id] = {
          id,
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData: log.args.staticData,
          encodedLengths: log.args.encodedLengths,
          dynamicData: log.args.dynamicData,
        };
        touchedIds.set(id, false);
      } else if (log.eventName === "Store_SpliceStaticData") {
        debug("splicing static data", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        const previousRecord = (rawRecords[id] as RawRecord | undefined) ?? {
          id,
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData: "0x",
          encodedLengths: "0x",
          dynamicData: "0x",
        };
        const staticData = spliceHex(previousRecord.staticData, log.args.start, size(log.args.data), log.args.data);
        rawRecords[id] = {
          ...previousRecord,
          staticData,
        };
        touchedIds.set(id, false);
      } else if (log.eventName === "Store_SpliceDynamicData") {
        debug("splicing dynamic data", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        const previousRecord = (rawRecords[id] as RawRecord | undefined) ?? {
          id,
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData: "0x",
          encodedLengths: "0x",
          dynamicData: "0x",
        };
        const encodedLengths = log.args.encodedLengths;
        const dynamicData = spliceHex(previousRecord.dynamicData, log.args.start, log.args.deleteCount, log.args.data);
        rawRecords[id] = {
          ...previousRecord,
          encodedLengths,
          dynamicData,
        };
        touchedIds.set(id, false);
      } else if (log.eventName === "Store_DeleteRecord") {
        debug("deleting record", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        delete rawRecords[id];
        touchedIds.set(id, true);
      }
    }

    if (!touchedIds.size) return;

    const updatedIds = Array.from(touchedIds.keys()).filter((id) => touchedIds.get(id) === false);
    const deletedIds = Array.from(touchedIds.keys()).filter((id) => touchedIds.get(id) === true);

    const previousRecords = store.getState().records;
    const records: typeof previousRecords = {
      ...Object.fromEntries(Object.entries(previousRecords).filter(([id]) => !deletedIds.includes(id))),
      ...Object.fromEntries(
        updatedIds
          .map((id) => {
            const rawRecord = rawRecords[id] as RawRecord | undefined;
            if (!rawRecord) {
              console.warn("no raw record found for updated ID", id);
              return;
            }
            const table = store.getState().tables[rawRecord.tableId];
            if (!table) {
              console.warn("no table found for record", rawRecord);
              return;
            }
            // TODO: warn if no table

            // TODO: update decodeKey to use more recent types
            const keySchema = getSchemaTypes(getKeySchema(table));
            const keyTupleLength = rawRecord.keyTuple.length;
            const keySchemaLength = Object.keys(keySchema).length;
            if (keySchemaLength !== keyTupleLength) {
              debug(
                `key tuple length ${keyTupleLength} does not match key schema length ${keySchemaLength}, skipping record`,
                {
                  table,
                  rawRecord,
                },
              );
              return undefined;
            }
            const key = decodeKey(keySchema, rawRecord.keyTuple);

            // TODO: update decodeValueArgs to use more recent types
            const value = decodeValueArgs(getSchemaTypes(getValueSchema(table)), rawRecord);

            return [
              id,
              {
                id,
                table: store.getState().tables[rawRecord.tableId],
                keyTuple: rawRecord.keyTuple,
                key,
                value,
                fields: { ...key, ...value },
              } satisfies TableRecord,
            ];
          })
          .filter(isDefined),
      ),
    };

    store.setState({ rawRecords, records });
  };
}
