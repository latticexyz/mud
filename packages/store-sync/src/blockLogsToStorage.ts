import { decodeField, decodeKeyTuple, decodeRecord, abiTypesToSchema, hexToSchema } from "@latticexyz/protocol-parser";
import {
  StoreConfig,
  ConfigToKeyPrimitives as Key,
  ConfigToValuePrimitives as Value,
  ConfigToValuePrimitives,
} from "@latticexyz/store";
import { decodeAbiParameters, getAddress, parseAbiParameters } from "viem";
import { debug } from "./debug";
import { isDefined } from "@latticexyz/common/utils";
import { BlockLogs, StorageAdapter, StorageOperation, Table } from "./common";
import { hexToTableId, tableIdToHex } from "@latticexyz/common";
import storeConfig from "@latticexyz/store/mud.config";

// TODO: adjust when we get namespace support (https://github.com/latticexyz/mud/issues/994) and when table has namespace key (https://github.com/latticexyz/mud/issues/1201)
const schemasTable = storeConfig.tables.Tables;
const schemasTableId = tableIdToHex(storeConfig.namespace, schemasTable.name);

export type BlockStorageOperations<TConfig extends StoreConfig = StoreConfig> = {
  blockNumber: BlockLogs["blockNumber"];
  operations: StorageOperation<TConfig>[];
};

export type BlockLogsToStorageResult<TConfig extends StoreConfig = StoreConfig> = (
  block: BlockLogs
) => Promise<BlockStorageOperations<TConfig>>;

export function blockLogsToStorage<TConfig extends StoreConfig = StoreConfig>({
  registerTables,
  getTables,
  storeOperations,
}: StorageAdapter<TConfig>): BlockLogsToStorageResult<TConfig> {
  return async (block) => {
    // Find table schema registration events
    const newTables = block.logs
      .map((log) => {
        try {
          if (log.eventName !== "StoreSetRecord") return;
          if (log.args.tableId !== schemasTableId) return;

          // TODO: refactor encode/decode to use Record<string, SchemaAbiType> schemas
          // TODO: refactor to decode key with protocol-parser utils

          const [tableId, ...otherKeys] = log.args.keyTuple;
          if (otherKeys.length) {
            console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
          }

          const table = hexToTableId(tableId);

          const valueTuple = decodeRecord(abiTypesToSchema(Object.values(schemasTable.valueSchema)), log.args.data);
          const value = Object.fromEntries(
            Object.keys(schemasTable.valueSchema).map((name, i) => [name, valueTuple[i]])
          ) as ConfigToValuePrimitives<typeof storeConfig, typeof schemasTable.name>;

          const keySchema = hexToSchema(value.keySchema);
          const valueSchema = hexToSchema(value.valueSchema);
          const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames)[0];
          const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames)[0];

          const valueAbiTypes = [...valueSchema.staticFields, ...valueSchema.dynamicFields];

          return {
            address: log.address,
            tableId,
            namespace: table.namespace,
            name: table.name,
            keySchema: Object.fromEntries(keySchema.staticFields.map((abiType, i) => [keyNames[i], abiType])),
            valueSchema: Object.fromEntries(valueAbiTypes.map((abiType, i) => [fieldNames[i], abiType])),
          };
        } catch (error: unknown) {
          console.error("Failed to get table from log", log, error);
        }
      })
      .filter(isDefined);

    // Then register tables before we start storing data in them
    if (newTables.length > 0) {
      await registerTables({
        blockNumber: block.blockNumber,
        tables: newTables,
      });
    }

    const tablesToFetch = Array.from(
      new Set(
        block.logs.map((log) =>
          JSON.stringify({
            address: getAddress(log.address),
            tableId: log.args.tableId,
            ...hexToTableId(log.args.tableId),
          })
        )
      )
    ).map((json) => JSON.parse(json));

    const tables = Object.fromEntries(
      (
        await getTables({
          blockNumber: block.blockNumber,
          tables: tablesToFetch,
        })
      ).map((table) => [`${getAddress(table.address)}:${table.tableId}`, table])
    ) as Record<string, Table>;

    const operations = block.logs
      .map((log): StorageOperation<TConfig> | undefined => {
        try {
          const table = tables[`${getAddress(log.address)}:${log.args.tableId}`];
          if (!table) {
            debug("no table found for event, skipping", hexToTableId(log.args.tableId), log);
            return;
          }

          const keyNames = Object.keys(table.keySchema);
          const keyValues = decodeKeyTuple(
            { staticFields: Object.values(table.keySchema), dynamicFields: [] },
            log.args.keyTuple
          );
          const key = Object.fromEntries(keyValues.map((value, i) => [keyNames[i], value])) as Key<
            TConfig,
            keyof TConfig["tables"]
          >;

          const valueAbiTypes = Object.values(table.valueSchema);
          const valueSchema = abiTypesToSchema(valueAbiTypes);
          const fieldNames = Object.keys(table.valueSchema);

          // TODO: decide if we should split these up into distinct operations so the storage adapter can decide whether to combine or not
          if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
            const valueTuple = decodeRecord(valueSchema, log.args.data);
            const value = Object.fromEntries(fieldNames.map((name, i) => [name, valueTuple[i]])) as Value<
              TConfig,
              keyof TConfig["tables"]
            >;
            return {
              log,
              address: getAddress(log.address),
              namespace: table.namespace,
              name: table.name,
              type: "SetRecord",
              key,
              value,
            };
          }

          if (log.eventName === "StoreSetField") {
            const fieldName = fieldNames[log.args.schemaIndex] as string &
              keyof Value<TConfig, keyof TConfig["tables"]>;
            const fieldValue = decodeField(valueAbiTypes[log.args.schemaIndex], log.args.data) as Value<
              TConfig,
              keyof TConfig["tables"]
            >[typeof fieldName];
            return {
              log,
              address: getAddress(log.address),
              namespace: table.namespace,
              name: table.name,
              type: "SetField",
              key,
              fieldName,
              fieldValue,
            };
          }

          if (log.eventName === "StoreDeleteRecord") {
            return {
              log,
              address: getAddress(log.address),
              namespace: table.namespace,
              name: table.name,
              type: "DeleteRecord",
              key,
            };
          }

          debug("unknown store event or log, skipping", log);
          return;
        } catch (error: unknown) {
          console.error("Failed to translate log to storage operation", log, error);
        }
      })
      .filter(isDefined);

    await storeOperations({ blockNumber: block.blockNumber, operations });

    return {
      blockNumber: block.blockNumber,
      operations,
    };
  };
}
