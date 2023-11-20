import { Tables } from "@latticexyz/store";
import { StorageAdapter } from "../common";
import { RawRecord } from "./common";
import { ZustandStore } from "./createStore";
import { hexToResource, spliceHex } from "@latticexyz/common";
import { debug } from "./debug";
import { getId } from "./getId";
import { size } from "viem";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";
import { flattenSchema } from "../flattenSchema";
import { isDefined } from "@latticexyz/common/utils";

export type CreateStorageAdapterOptions<tables extends Tables> = {
  store: ZustandStore<tables>;
};

export function createStorageAdapter<tables extends Tables>({
  store,
}: CreateStorageAdapterOptions<tables>): StorageAdapter {
  return async function zustandStorageAdapter({ blockNumber, logs }) {
    // TODO: clean this up so that we do one store write per block

    const updatedIds: string[] = [];
    const deletedIds: string[] = [];

    for (const log of logs) {
      const table = store.getState().tables[log.args.tableId];
      if (!table) {
        const { namespace, name } = hexToResource(log.args.tableId);
        debug(`skipping update for unknown table: ${namespace}:${name} (${log.args.tableId}) at ${log.address}`);
        console.log(store.getState().tables, log.args.tableId);
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
        updatedIds.push(id);
        store.setState({
          rawRecords: {
            ...store.getState().rawRecords,
            [id]: {
              id,
              tableId: log.args.tableId,
              keyTuple: log.args.keyTuple,
              staticData: log.args.staticData,
              encodedLengths: log.args.encodedLengths,
              dynamicData: log.args.dynamicData,
            },
          },
        });
      } else if (log.eventName === "Store_SpliceStaticData") {
        debug("splicing static data", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        updatedIds.push(id);
        const previousRecord = (store.getState().rawRecords[id] as RawRecord | undefined) ?? {
          id,
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData: "0x",
          encodedLengths: "0x",
          dynamicData: "0x",
        };
        const staticData = spliceHex(previousRecord.staticData, log.args.start, size(log.args.data), log.args.data);
        store.setState({
          rawRecords: {
            ...store.getState().rawRecords,
            [id]: {
              ...previousRecord,
              staticData,
            },
          },
        });
      } else if (log.eventName === "Store_SpliceDynamicData") {
        debug("splicing dynamic data", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        updatedIds.push(id);
        const previousRecord = (store.getState().rawRecords[id] as RawRecord | undefined) ?? {
          id,
          tableId: log.args.tableId,
          keyTuple: log.args.keyTuple,
          staticData: "0x",
          encodedLengths: "0x",
          dynamicData: "0x",
        };
        const encodedLengths = log.args.encodedLengths;
        const dynamicData = spliceHex(previousRecord.dynamicData, log.args.start, log.args.deleteCount, log.args.data);
        store.setState({
          rawRecords: {
            ...store.getState().rawRecords,
            [id]: {
              ...previousRecord,
              encodedLengths,
              dynamicData,
            },
          },
        });
      } else if (log.eventName === "Store_DeleteRecord") {
        debug("deleting record", {
          namespace: table.namespace,
          name: table.name,
          id,
          log,
        });
        deletedIds.push(id);
        const { [id]: deletedRecord, ...rawRecords } = store.getState().rawRecords;
        store.setState({ rawRecords });
      }
    }

    if (!updatedIds.length && !deletedIds.length) return;

    const records = {
      ...Object.fromEntries(Object.entries(store.getState().records).filter(([id]) => !deletedIds.includes(id))),
      ...Object.fromEntries(
        updatedIds
          .map((id) => {
            const rawRecord = store.getState().rawRecords[id];
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
            return [
              id,
              {
                id,
                table: store.getState().tables[rawRecord.tableId],
                keyTuple: rawRecord.keyTuple,
                key: decodeKey(flattenSchema(table.keySchema), rawRecord.keyTuple),
                value: decodeValueArgs(flattenSchema(table.valueSchema), rawRecord),
              },
            ];
          })
          .filter(isDefined)
      ),
    };

    store.setState({ records });
  };
}
