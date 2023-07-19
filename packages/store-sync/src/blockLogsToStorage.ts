import {
  decodeField,
  decodeKeyTuple,
  decodeRecord,
  hexToTableSchema,
  abiTypesToSchema,
  TableSchema,
} from "@latticexyz/protocol-parser";
import { GroupLogsByBlockNumberResult, GetLogsResult } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi, StoreConfig } from "@latticexyz/store";
import { TableId } from "@latticexyz/common";
import { Address, Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { debug } from "./debug";
// TODO: move these type helpers into store?
import { Key, Value } from "@latticexyz/store-cache";
import { isDefined } from "@latticexyz/common/utils";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";

// TODO: change table schema/metadata APIs once we get both schema and field names in the same event (https://github.com/latticexyz/mud/pull/1182)

// TODO: export these from store or world
export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

export type StoreEventsLog = GetLogsResult<StoreEventsAbi>[number];
export type BlockLogs = GroupLogsByBlockNumberResult<StoreEventsLog>[number];

export type StoredTable = {
  address: Address;
  namespace: string;
  name: string;
  keySchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, SchemaAbiType>;
};

export type BaseStorageOperation = {
  log: StoreEventsLog;
  namespace: string;
};

export type SetRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetRecord";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable;
      key: Key<TConfig, TTable>;
      value: Value<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type SetFieldOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetField";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable;
      key: Key<TConfig, TTable>;
    } & {
      [TValue in keyof Value<TConfig, TTable>]: {
        fieldName: TValue;
        fieldValue: Value<TConfig, TTable>[TValue];
      };
    }[keyof Value<TConfig, TTable>];
  }[keyof TConfig["tables"]];

export type DeleteRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "DeleteRecord";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable;
      key: Key<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type StorageOperation<TConfig extends StoreConfig> =
  | SetFieldOperation<TConfig>
  | SetRecordOperation<TConfig>
  | DeleteRecordOperation<TConfig>;

export type BlockLogsToStorageOptions<TConfig extends StoreConfig = StoreConfig> = {
  registerTables: (opts: { blockNumber: BlockLogs["blockNumber"]; tables: StoredTable[] }) => Promise<void>;
  getTables: (opts: {
    blockNumber: BlockLogs["blockNumber"];
    tables: Pick<StoredTable, "address" | "namespace" | "name">[];
  }) => Promise<StoredTable[]>;
  storeOperations: (opts: {
    blockNumber: BlockLogs["blockNumber"];
    operations: StorageOperation<TConfig>[];
  }) => Promise<void>;
};

export type BlockLogsToStorageResult<TConfig extends StoreConfig = StoreConfig> = (block: BlockLogs) => Promise<{
  blockNumber: BlockLogs["blockNumber"];
  operations: StorageOperation<TConfig>[];
}>;

type TableNamespace = string;
type TableName = string;
type TableKey = `${Address}:${TableNamespace}:${TableName}`;

// hacky fix for schema registration + metadata events spanning multiple blocks
// TODO: remove this once schema registration+metadata is one event or tx (https://github.com/latticexyz/mud/pull/1182)
const visitedSchemas = new Map<TableKey, { address: Address; tableId: TableId; schema: TableSchema }>();
const visitedMetadata = new Map<
  TableKey,
  { address: Address; tableId: TableId; keyNames: readonly string[]; valueNames: readonly string[] }
>();

export function blockLogsToStorage<TConfig extends StoreConfig = StoreConfig>({
  registerTables,
  getTables,
  storeOperations,
}: BlockLogsToStorageOptions<TConfig>): BlockLogsToStorageResult<TConfig> {
  return async (block) => {
    const newTableKeys = new Set<TableKey>();

    block.logs.forEach((log) => {
      if (log.eventName !== "StoreSetRecord") return;
      if (log.args.table !== schemaTableId.toHex()) return;

      const [tableForSchema, ...otherKeys] = log.args.key;
      if (otherKeys.length) {
        debug("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
      }

      const tableId = TableId.fromHex(tableForSchema);
      const schema = hexToTableSchema(log.args.data);

      const key: TableKey = `${log.address}:${tableId.namespace}:${tableId.name}`;
      if (!visitedSchemas.has(key)) {
        visitedSchemas.set(key, { address: log.address, tableId, schema });
        newTableKeys.add(key);
      }
    });

    // Then find all metadata events. These should follow schema registration events and be in the same block (since they're in the same tx).
    // TODO: rework contracts so schemas+tables are combined and immutable (https://github.com/latticexyz/mud/pull/1182)
    block.logs.forEach((log) => {
      if (log.eventName !== "StoreSetRecord") return;
      if (log.args.table !== metadataTableId.toHex()) return;

      const [tableForSchema, ...otherKeys] = log.args.key;
      if (otherKeys.length) {
        debug("setMetadata event is expected to have only one key in key tuple, but got multiple", log);
      }

      const tableId = TableId.fromHex(tableForSchema);
      const [tableName, abiEncodedFieldNames] = decodeRecord(
        // TODO: this is hardcoded for now while metadata is separate from table registration (https://github.com/latticexyz/mud/pull/1182)
        { staticFields: [], dynamicFields: ["string", "bytes"] },
        log.args.data
      );
      const valueNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames as Hex)[0];
      // TODO: add key names to table registration when we refactor it (https://github.com/latticexyz/mud/pull/1182)

      const key: TableKey = `${log.address}:${tableId.namespace}:${tableName}`;
      if (!visitedMetadata.has(key)) {
        visitedMetadata.set(key, { address: log.address, tableId, keyNames: [], valueNames });
        newTableKeys.add(key);
      }
    });

    const newTableIds = Array.from(newTableKeys).map((tableKey) => {
      const [address, namespace, name] = tableKey.split(":");
      return { address: address as Hex, tableId: new TableId(namespace, name) };
    });

    await registerTables({
      blockNumber: block.blockNumber,
      tables: newTableIds
        .map(({ address, tableId }) => {
          const schema = Array.from(visitedSchemas.values()).find(
            ({ address: schemaAddress, tableId: schemaTableId }) =>
              schemaAddress === address && schemaTableId.toHex() === tableId.toHex()
          );
          const metadata = Array.from(visitedMetadata.values()).find(
            ({ address: metadataAddress, tableId: metadataTableId }) =>
              metadataAddress === address && metadataTableId.toHex() === tableId.toHex()
          );
          if (!schema) {
            debug(
              `no schema registration found for table ${tableId.toString()} in block ${block.blockNumber}, skipping`
            );
            return;
          }
          if (!metadata) {
            debug(
              `no metadata registration found for table ${tableId.toString()} in block ${block.blockNumber}, skipping`
            );
            return;
          }

          const valueAbiTypes = [...schema.schema.valueSchema.staticFields, ...schema.schema.valueSchema.dynamicFields];

          return {
            address,
            namespace: schema.tableId.namespace,
            name: schema.tableId.name,
            // TODO: replace with proper named key tuple (https://github.com/latticexyz/mud/pull/1182)
            keySchema: Object.fromEntries(schema.schema.keySchema.staticFields.map((abiType, i) => [i, abiType])),
            valueSchema: Object.fromEntries(valueAbiTypes.map((abiType, i) => [metadata.valueNames[i], abiType])),
          };
        })
        .filter(isDefined),
    });

    const tableIds = Array.from(
      new Set(
        block.logs.map((log) =>
          JSON.stringify({
            address: log.address,
            ...TableId.fromHex(log.args.table),
          })
        )
      )
    );
    // TODO: combine these once we refactor table registration (https://github.com/latticexyz/mud/pull/1182)
    const tables = Object.fromEntries(
      (
        await getTables({
          blockNumber: block.blockNumber,
          tables: tableIds.map((json) => JSON.parse(json)),
        })
      ).map((table) => [`${table.address}:${new TableId(table.namespace, table.name).toHex()}`, table])
    ) as Record<Hex, StoredTable>;

    const operations = block.logs
      .map((log): StorageOperation<TConfig> | undefined => {
        const tableId = TableId.fromHex(log.args.table);
        const table = tables[`${log.address}:${log.args.table}`];
        if (!table) {
          debug("no table found for event, skipping", tableId.toString(), log);
          return;
        }

        const keyNames = Object.keys(table.keySchema);
        const keyValues = decodeKeyTuple(
          { staticFields: Object.values(table.keySchema), dynamicFields: [] },
          log.args.key
        );
        const key = Object.fromEntries(keyValues.map((value, i) => [keyNames[i], value])) as Key<
          TConfig,
          keyof TConfig["tables"]
        >;

        const valueAbiTypes = Object.values(table.valueSchema);
        const valueSchema = abiTypesToSchema(valueAbiTypes);
        const fieldNames = Object.keys(table.valueSchema);

        if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
          const valueTuple = decodeRecord(valueSchema, log.args.data);
          const value = Object.fromEntries(fieldNames.map((name, i) => [name, valueTuple[i]])) as Value<
            TConfig,
            keyof TConfig["tables"]
          >;
          // TODO: decide if we should handle ephemeral records separately?
          //       they'll eventually be turned into "events", but unclear if that should translate to client storage operations
          return {
            log,
            type: "SetRecord",
            ...tableId,
            key,
            value,
          };
        }

        if (log.eventName === "StoreSetField") {
          const fieldName = fieldNames[log.args.schemaIndex] as string & keyof Value<TConfig, keyof TConfig["tables"]>;
          const fieldValue = decodeField(valueAbiTypes[log.args.schemaIndex], log.args.data) as Value<
            TConfig,
            keyof TConfig["tables"]
          >[typeof fieldName];
          return {
            log,
            type: "SetField",
            ...tableId,
            key,
            fieldName,
            fieldValue,
          };
        }

        if (log.eventName === "StoreDeleteRecord") {
          return {
            log,
            type: "DeleteRecord",
            ...tableId,
            key,
          };
        }

        debug("unknown store event or log, skipping", log);
        return;
      })
      .filter(isDefined);

    await storeOperations({ blockNumber: block.blockNumber, operations });

    return {
      blockNumber: block.blockNumber,
      operations,
    };
  };
}
