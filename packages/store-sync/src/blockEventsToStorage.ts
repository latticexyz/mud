import {
  TableSchema,
  decodeField,
  decodeKeyTuple,
  decodeRecord,
  hexToTableSchema,
  schemaIndexToAbiType,
} from "@latticexyz/protocol-parser";
import { GroupLogsByBlockNumberResult, GetLogsResult } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi, StoreConfig } from "@latticexyz/store";
import { TableId } from "@latticexyz/common";
import { Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { debug } from "./debug";
// TODO: move these type helpers into store?
import { Key, Value } from "@latticexyz/store-cache";
import { isDefined } from "@latticexyz/common/utils";

// TODO: change table schema/metadata APIs once we get both schema and field names in the same event

// TODO: export these from store or world
export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

// I don't love carrying all these types through. Ideally this should be the shape of the thing we want, rather than the specific return type from a function.
export type BlockEvents = GroupLogsByBlockNumberResult<GetLogsResult<StoreEventsAbi>[number]>[number];

export type StoredTableSchema = {
  namespace: string;
  name: string;
  schema: TableSchema;
};

export type StoredTableMetadata = {
  namespace: string;
  name: string;
  keyNames: readonly string[];
  valueNames: readonly string[];
};

export type SetRecordOperation<TConfig extends StoreConfig> = {
  type: "SetRecord";
  address: string;
  namespace: string;
} & {
  [TTable in keyof TConfig["tables"]]: {
    name: TTable;
    keyTuple: Key<TConfig, TTable>;
    record: Value<TConfig, TTable>;
  };
}[keyof TConfig["tables"]];

export type SetFieldOperation<TConfig extends StoreConfig> = {
  type: "SetField";
  address: string;
  namespace: string;
} & {
  [TTable in keyof TConfig["tables"]]: {
    name: TTable;
    keyTuple: Key<TConfig, TTable>;
  } & {
    [TValue in keyof Value<TConfig, TTable>]: {
      // TODO: standardize on calling these "fields" or "values" or maybe "columns"
      valueName: TValue;
      value: Value<TConfig, TTable>[TValue];
    };
  }[keyof Value<TConfig, TTable>];
}[keyof TConfig["tables"]];

export type DeleteRecordOperation<TConfig extends StoreConfig> = {
  type: "DeleteRecord";
  address: string;
  namespace: string;
} & {
  [TTable in keyof TConfig["tables"]]: {
    name: TTable;
    keyTuple: Key<TConfig, TTable>;
  };
}[keyof TConfig["tables"]];

export type StorageOperation<TConfig extends StoreConfig> =
  | SetFieldOperation<TConfig>
  | SetRecordOperation<TConfig>
  | DeleteRecordOperation<TConfig>;

export type BlockEventsToStorageOptions = {
  registerTableSchema: (data: StoredTableSchema) => Promise<void>;
  registerTableMetadata: (data: StoredTableMetadata) => Promise<void>;
  getTableSchema: (opts: Pick<StoredTableSchema, "namespace" | "name">) => Promise<StoredTableSchema | undefined>;
  getTableMetadata: (opts: Pick<StoredTableMetadata, "namespace" | "name">) => Promise<StoredTableMetadata | undefined>;
};

export function blockEventsToStorage<TConfig extends StoreConfig = StoreConfig>({
  registerTableMetadata,
  registerTableSchema,
  getTableMetadata,
  getTableSchema,
}: BlockEventsToStorageOptions): (block: BlockEvents) => Promise<{
  blockNumber: BlockEvents["blockNumber"];
  blockHash: BlockEvents["blockHash"];
  operations: StorageOperation<TConfig>[];
}> {
  return async (block) => {
    // Find and register all new table schemas
    // Store schemas are immutable, so we can parallelize this
    await Promise.all(
      block.logs.map(async (log) => {
        if (log.eventName !== "StoreSetRecord") return;
        if (log.args.table !== schemaTableId.toHex()) return;

        const [tableForSchema, ...otherKeys] = log.args.key;
        if (otherKeys.length) {
          debug("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
        }

        const tableId = TableId.fromHex(tableForSchema);
        const schema = hexToTableSchema(log.args.data);

        await registerTableSchema({ ...tableId, schema });
      })
    );

    const metadataTableSchema = await getTableSchema(metadataTableId);
    if (!metadataTableSchema) {
      // TODO: better error
      throw new Error("metadata table schema was not registered");
    }

    // Find and register all new table metadata
    // Table metadata is technically mutable, but all of our code assumes its immutable, so we'll continue that trend
    // TODO: rework contracts so schemas+tables are combined and immutable
    await Promise.all(
      block.logs.map(async (log) => {
        if (log.eventName !== "StoreSetRecord") return;
        if (log.args.table !== metadataTableId.toHex()) return;

        const [tableForSchema, ...otherKeys] = log.args.key;
        if (otherKeys.length) {
          debug("setMetadata event is expected to have only one key in key tuple, but got multiple", log);
        }

        const tableId = TableId.fromHex(tableForSchema);
        const [tableName, abiEncodedFieldNames] = decodeRecord(metadataTableSchema.schema.valueSchema, log.args.data);
        const valueNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames as Hex)[0];

        // TODO: add key names to table registration when we refactor it
        await registerTableMetadata({ ...tableId, keyNames: [], valueNames });
      })
    );

    const tables = Array.from(new Set(block.logs.map((log) => log.args.table))).map((tableHex) =>
      TableId.fromHex(tableHex)
    );
    // TODO: combine these once we refactor table registration
    const tableSchemas = Object.fromEntries(
      await Promise.all(tables.map(async (table) => [table.toHex(), await getTableSchema(table)]))
    ) as Record<Hex, StoredTableSchema>;
    const tableMetadatas = Object.fromEntries(
      await Promise.all(tables.map(async (table) => [table.toHex(), await getTableMetadata(table)]))
    ) as Record<Hex, StoredTableMetadata>;

    const operations = block.logs
      .map((log): StorageOperation<TConfig> | undefined => {
        const tableId = TableId.fromHex(log.args.table);
        const tableSchema = tableSchemas[log.args.table];
        const tableMetadata = tableMetadatas[log.args.table];
        if (!tableSchema) {
          debug("no table schema found for event, skipping", tableId.toString(), log);
          return;
        }
        if (!tableMetadata) {
          debug("no table metadata found for event, skipping", tableId.toString(), log);
          return;
        }

        const keyTupleValues = decodeKeyTuple(tableSchema.schema.keySchema, log.args.key);
        const keyTuple = Object.fromEntries(
          keyTupleValues.map((value, i) => [tableMetadata.keyNames[i] ?? i, value])
        ) as Key<TConfig, keyof TConfig["tables"]>;

        if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
          const values = decodeRecord(tableSchema.schema.valueSchema, log.args.data);
          const record = Object.fromEntries(tableMetadata.valueNames.map((name, i) => [name, values[i]])) as Value<
            TConfig,
            keyof TConfig["tables"]
          >;
          // TODO: decide if we should handle ephemeral records separately?
          //       they'll eventually be turned into "events", but unclear if that should translate to client storage operations
          return {
            address: log.address,
            type: "SetRecord",
            ...tableId,
            keyTuple,
            record,
          };
        }

        if (log.eventName === "StoreSetField") {
          const valueName = tableMetadata.valueNames[log.args.schemaIndex] as string &
            keyof Value<TConfig, keyof TConfig["tables"]>;
          const value = decodeField(
            schemaIndexToAbiType(tableSchema.schema.valueSchema, log.args.schemaIndex),
            log.args.data
          ) as Value<TConfig, keyof TConfig["tables"]>[typeof valueName];
          console.log("setting field", { ...tableId, keyTuple, valueName, value });
          return {
            address: log.address,
            type: "SetField",
            ...tableId,
            keyTuple,
            valueName,
            value,
          };
        }

        if (log.eventName === "StoreDeleteRecord") {
          return {
            address: log.address,
            type: "DeleteRecord",
            ...tableId,
            keyTuple,
          };
        }

        debug("unknown store event or log, skipping", log);
        return;
      })
      .filter(isDefined);

    return {
      blockNumber: block.blockNumber,
      blockHash: block.blockHash,
      operations,
    };
  };
}
