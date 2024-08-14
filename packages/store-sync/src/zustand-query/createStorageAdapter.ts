import { hexToResource, resourceToLabel, spliceHex } from "@latticexyz/common";
import {
  KeySchema,
  decodeKey,
  decodeValueArgs,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { size } from "viem";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { Store, getConfig, getTable, registerTable } from "@latticexyz/zustand-query/internal";
import { debug } from "./debug";

export type CreateStorageAdapterOptions = {
  store: Store;
};

export type CreateStorageAdapterResult = {
  storageAdapter: StorageAdapter;
};

const emptyValueArgs = { staticData: "0x", encodedLengths: "0x", dynamicData: "0x" } as const;

export function createStorageAdapter({ store }: CreateStorageAdapterOptions): CreateStorageAdapterResult {
  async function storageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);

    for (const newTable of newTables) {
      // TODO: switch this to `newTable.label` once available
      const existingTable = store.get().config[newTable.namespace]?.[newTable.name];
      if (existingTable) {
        console.warn("table already registered, ignoring", {
          newTable,
          existingTable,
        });
      } else {
        // TODO: create util for converting table config
        registerTable({
          store,
          table: {
            ...newTable,
            key: newTable.key as string[],
            label: newTable.name,
            schema: Object.fromEntries(Object.entries(newTable.schema).map(([field, { type }]) => [field, type])),
          },
        });
      }
    }

    // Convert logs in (partial) table updates
    for (const log of logs) {
      // TODO: find table config by table ID
      const { namespace, name } = hexToResource(log.args.tableId);
      // TODO: use label once available
      const tableConfig = store.get().config[namespace][name];
      const boundTable = getTable({
        store,
        table: getConfig({ store, table: { namespaceLabel: namespace, label: name } }),
      });

      if (!tableConfig || !boundTable) {
        debug(`skipping update for unknown table: ${resourceToLabel({ namespace, name })} at ${log.address}`);
        continue;
      }

      const valueSchema = getSchemaTypes(getValueSchema(tableConfig));
      const keySchema = getSchemaTypes(getKeySchema(tableConfig)) as KeySchema;
      const key = decodeKey(keySchema, log.args.keyTuple);

      if (log.eventName === "Store_SetRecord") {
        // TODO: is there a more elegant way to do this (converting table config to expected schema)?
        const record = decodeValueArgs(valueSchema, log.args);
        debug("setting table record", {
          namespace: tableConfig.namespace,
          name: tableConfig.name,
          key,
          record,
        });

        boundTable.setRecord({ key, record });
      } else if (log.eventName === "Store_SpliceStaticData") {
        // TODO: add tests that this works when no record had been set before
        const previousRecord = boundTable.getRecord({ key });

        // TODO: maybe better to also store the static data than to re-encode here?
        const {
          staticData: previousStaticData,
          encodedLengths,
          dynamicData,
        } = previousRecord ? encodeValueArgs(valueSchema, previousRecord) : emptyValueArgs;

        const newStaticData = spliceHex(previousStaticData, log.args.start, size(log.args.data), log.args.data);
        const newValue = decodeValueArgs(valueSchema, {
          staticData: newStaticData,
          encodedLengths,
          dynamicData,
        });

        debug("setting record via splice static", {
          namespace,
          name,
          key,
          previousStaticData,
          newStaticData,
          previousRecord,
          newValue,
        });
        boundTable.setRecord({ key, record: newValue });
      } else if (log.eventName === "Store_SpliceDynamicData") {
        // TODO: add tests that this works when no record had been set before
        const previousRecord = boundTable.getRecord({ key });

        // TODO: maybe better to also store the dynamic data than to re-encode here?
        console.log("what's going on now", previousRecord, valueSchema);
        const { staticData, dynamicData: previousDynamicData } = previousRecord
          ? encodeValueArgs(valueSchema, previousRecord)
          : emptyValueArgs;

        const newDynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);
        const newValue = decodeValueArgs(valueSchema, {
          staticData,
          // TODO: handle unchanged encoded lengths (comment taken from recs sync, what does this mean?)
          encodedLengths: log.args.encodedLengths,
          dynamicData: newDynamicData,
        });

        debug("setting record via splice dynamic", {
          namespace,
          name,
          key,
          previousDynamicData,
          newDynamicData,
          previousRecord,
          newValue,
        });

        boundTable.setRecord({ key, record: newValue });
      } else if (log.eventName === "Store_DeleteRecord") {
        debug("deleting record", {
          namespace,
          name,
          key,
        });
        boundTable.deleteRecord({ key });
      }
    }
  }

  return { storageAdapter };
}
