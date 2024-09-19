import { Stash, deleteRecord, getRecord, setRecord } from "@latticexyz/stash/internal";
import {
  decodeKey,
  decodeValueArgs,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { spliceHex } from "@latticexyz/common";
import { size } from "viem";
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

  return async function storageAdapter({ logs }: StorageAdapterBlock): Promise<void> {
    for (const log of logs) {
      const table = tablesById[log.args.tableId];
      if (!table) continue;

      const valueSchema = getSchemaTypes(getValueSchema(table));
      const keySchema = getSchemaTypes(getKeySchema(table));
      const key = decodeKey(keySchema, log.args.keyTuple);

      if (log.eventName === "Store_SetRecord") {
        const value = decodeValueArgs(valueSchema, log.args);
        setRecord({ stash, table, key, value });
      } else if (log.eventName === "Store_SpliceStaticData") {
        const previousValue = getRecord({ stash, table, key });

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

        setRecord({ stash, table, key, value });
      } else if (log.eventName === "Store_SpliceDynamicData") {
        const previousValue = getRecord({ stash, table, key });

        const { staticData, dynamicData: previousDynamicData } = previousValue
          ? encodeValueArgs(valueSchema, previousValue)
          : emptyValueArgs;

        const dynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);
        const value = decodeValueArgs(valueSchema, {
          staticData,
          encodedLengths: log.args.encodedLengths,
          dynamicData,
        });

        setRecord({ stash, table, key, value });
      } else if (log.eventName === "Store_DeleteRecord") {
        deleteRecord({ stash, table, key });
      }
    }
  };
}
