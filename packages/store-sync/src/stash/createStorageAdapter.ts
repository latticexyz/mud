import { World } from "@latticexyz/world";
import { StorageAdapterBlock, StorageAdapter } from "../common";
import {
  decodeKey,
  decodeValueArgs,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { CreateStoreResult, getTable } from "@latticexyz/stash/internal";
import { spliceHex } from "@latticexyz/common";
import { size } from "viem";

export type CreateStorageAdapterOptions<config extends World> = {
  config: config;
  stash: CreateStoreResult;
};

const emptyValueArgs = {
  staticData: "0x",
  encodedLengths: "0x",
  dynamicData: "0x",
} as const;

export function createStorageAdapter<config extends World>({
  config,
  stash,
}: CreateStorageAdapterOptions<config>): StorageAdapter {
  const tablesById = Object.fromEntries(
    Object.values(config.namespaces)
      .flatMap((namespace) => Object.values(namespace.tables))
      .map((table) => [table.tableId, table]),
  );

  return async function storageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    for (const log of logs) {
      const tableConfig = tablesById[log.args.tableId];
      if (!tableConfig) continue;

      // TODO: this should probably return `| undefined`?
      const table = getTable({ stash, table: tableConfig });

      const valueSchema = getSchemaTypes(getValueSchema(tableConfig));
      const keySchema = getSchemaTypes(getKeySchema(tableConfig));
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
