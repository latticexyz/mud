import { CreateStoreResult, getTable, StoreConfig } from "@latticexyz/stash/internal";
import {
  decodeKey,
  decodeValueArgs,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
  KeySchema,
} from "@latticexyz/protocol-parser/internal";
import { spliceHex } from "@latticexyz/common";
import { size } from "viem";
import { Table } from "@latticexyz/config";
import { StorageAdapter, StorageAdapterBlock, emptyValueArgs } from "../common";

export type CreateStorageAdapter<config extends StoreConfig> = {
  stash: CreateStoreResult<config>;
};

export function createStorageAdapter<const config extends StoreConfig>({
  stash,
}: CreateStorageAdapter<config>): StorageAdapter {
  const tables = Object.values(stash.get().config).flatMap((namespace) => Object.values(namespace)) as readonly Table[];

  return async function storageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    for (const log of logs) {
      const tableConfig = tables.find((t) => t.tableId === log.args.tableId);
      if (!tableConfig) continue;

      // TODO: this should probably return `| undefined`?
      const table = getTable({ stash, table: tableConfig });

      const valueSchema = getSchemaTypes(getValueSchema(tableConfig));
      const keySchema = getSchemaTypes(getKeySchema(tableConfig)) as KeySchema;
      const key = decodeKey(keySchema, log.args.keyTuple);

      if (log.eventName === "Store_SetRecord") {
        const value = decodeValueArgs(valueSchema, log.args);
        table.setRecord({ key, value });
      } else if (log.eventName === "Store_SpliceStaticData") {
        const previousValue = table.getRecord({ key });

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

        table.setRecord({ key, value });
      } else if (log.eventName === "Store_SpliceDynamicData") {
        const previousValue = table.getRecord({ key });

        const { staticData, dynamicData: previousDynamicData } = previousValue
          ? encodeValueArgs(valueSchema, previousValue)
          : emptyValueArgs;

        const dynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);
        const value = decodeValueArgs(valueSchema, {
          staticData,
          encodedLengths: log.args.encodedLengths,
          dynamicData,
        });

        table.setRecord({ key, value });
      } else if (log.eventName === "Store_DeleteRecord") {
        table.deleteRecord({ key });
      }
    }
  };
}
