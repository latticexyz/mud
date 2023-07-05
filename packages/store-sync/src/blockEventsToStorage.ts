import {
  TableSchema,
  decodeField,
  decodeKeyTuple,
  decodeRecord,
  hexToTableSchema,
  schemaIndexToAbiType,
} from "@latticexyz/protocol-parser";
import { GroupLogsByBlockNumberResult, GetLogsResult } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi, StoreConfig, ExpandTablesConfig } from "@latticexyz/store";
import { TableId } from "@latticexyz/common";
import { Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import {
  SchemaAbiType,
  SchemaAbiTypeToPrimitiveType,
  StaticAbiType,
  StaticAbiTypeToPrimitiveType,
} from "@latticexyz/schema-type";
import { debug } from "./debug";
// TODO: move these type helpers into store?
import { Key, Value } from "@latticexyz/store-cache";

// TODO: change table schema/metadata APIs once we get both schema and field names in the same event
// TODO: support passing in a MUD config to get typed tables, values, etc.
// TODO: consider if we should continue to group storage operations by block, allowing atomic sets (db txs) and collapsing operations per table+key
//       or potentially have a start/end transaction and pass in the tx to each storage operation

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

export type SetRecordOptions<
  TConfig extends StoreConfig,
  TTableName extends string = string & keyof ExpandTablesConfig<TConfig["tables"]>
> = {
  namespace: string;
  name: TTableName;
  keyTuple: Key<TConfig, TTableName>;
  record: Value<TConfig, TTableName>;
};

export type SetFieldOptions<
  TConfig extends StoreConfig,
  TTableName extends string = string & keyof ExpandTablesConfig<TConfig["tables"]>,
  TValueName extends string = string & keyof Value<TConfig, TTableName>
> = {
  namespace: string;
  name: string;
  keyTuple: Key<TConfig, TTableName>;
  // TODO: standardize on calling these "fields" or "values" or maybe "columns"
  valueName: TValueName;
  value: Value<TConfig, TTableName>[TValueName];
};

export type DeleteRecordOptions<
  TConfig extends StoreConfig,
  TTableName extends string = string & keyof ExpandTablesConfig<TConfig["tables"]>
> = {
  namespace: string;
  name: string;
  keyTuple: Key<TConfig, TTableName>;
};

export type BlockEventsToStorageOptions<TConfig extends StoreConfig = StoreConfig> = {
  registerTableSchema: (data: StoredTableSchema) => Promise<void>;
  registerTableMetadata: (data: StoredTableMetadata) => Promise<void>;
  getTableSchema: (opts: Pick<StoredTableSchema, "namespace" | "name">) => Promise<StoredTableSchema | undefined>;
  getTableMetadata: (opts: Pick<StoredTableMetadata, "namespace" | "name">) => Promise<StoredTableMetadata | undefined>;
  setRecord: (opts: SetRecordOptions<TConfig>) => Promise<void>;
  setField: (opts: SetFieldOptions<TConfig>) => Promise<void>;
  deleteRecord: (opts: DeleteRecordOptions<TConfig>) => Promise<void>;
};

export function blockEventsToStorage<TConfig extends StoreConfig = StoreConfig>({
  registerTableMetadata,
  registerTableSchema,
  getTableMetadata,
  getTableSchema,
  setRecord,
  setField,
  deleteRecord,
}: BlockEventsToStorageOptions<TConfig>): (block: BlockEvents) => Promise<void> {
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

    // Because storage operations are atomic, we need to do this serially
    // TODO: make this smarter, maybe parallelize by table?
    for (const log of block.logs) {
      const tableId = TableId.fromHex(log.args.table);
      const [tableSchema, tableMetadata] = await Promise.all([getTableSchema(tableId), getTableMetadata(tableId)]);
      if (!tableSchema) {
        debug("no table schema found for event, skipping", tableId.toString(), log);
        continue;
      }
      if (!tableMetadata) {
        debug("no table metadata found for event, skipping", tableId.toString(), log);
        continue;
      }

      console.log("log", log, tableSchema, tableMetadata, {
        blockNumber: block.blockNumber,
        blockHash: block.blockHash,
        logs: [log],
      });

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
        await setRecord({ ...tableId, keyTuple, record });
      } else if (log.eventName === "StoreSetField") {
        const valueName = tableMetadata.valueNames[log.args.schemaIndex] as string &
          keyof Value<TConfig, keyof TConfig["tables"]>;
        const value = decodeField(
          schemaIndexToAbiType(tableSchema.schema.valueSchema, log.args.schemaIndex),
          log.args.data
        ) as Value<TConfig, keyof TConfig["tables"]>[typeof valueName];
        console.log("setting field", { ...tableId, keyTuple, valueName, value });
        await setField({ ...tableId, keyTuple, valueName, value });
      } else if (log.eventName === "StoreDeleteRecord") {
        await deleteRecord({ ...tableId, keyTuple });
      } else {
        debug("unknown store event, skipping", log);
      }
    }
  };
}
