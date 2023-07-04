import {
  TableSchema,
  decodeField,
  decodeKeyTuple,
  decodeRecord,
  hexToTableSchema,
  schemaIndexToAbiType,
} from "@latticexyz/protocol-parser";
import { GroupLogsByBlockNumberResult, GetLogsResult } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi } from "@latticexyz/store";
import { TableId } from "@latticexyz/common";
import { Hex, decodeAbiParameters, parseAbiParameters } from "viem";

// TODO: change table schema/metadata APIs once we get both schema and field names in the same event
// TODO: support passing in a MUD config to get typed tables, values, etc.
// TODO: consider if we should continue to group storage operations by block, allowing atomic sets (db txs) and collapsing operations per table+key

// TODO: export these from store or world
export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

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

export type SetRecordOptions = {
  namespace: string;
  name: string;
  // TODO: refine to at least the possible static primitive types, if not the actual key tuple types
  keyTuple: Record<string, any>;
  // TODO: refine to at least the possible primitive types, if not the actual table types
  record: Record<string, any>;
  // TODO: include schema, block/tx/event info?
};

export type SetFieldOptions = {
  namespace: string;
  name: string;
  // TODO: refine to at least the possible static primitive types, if not the actual key tuple types
  keyTuple: Record<string, any>;
  // TODO: standardize on calling these "fields" or "values" or maybe "columns"
  valueName: string;
  // TODO: refine to at least the possible primitive types, if not the actual type based on fieldName
  value: any;
  // TODO: include schema, block/tx/event info?
};

export type DeleteRecordOptions = {
  namespace: string;
  name: string;
  // TODO: refine to at least the possible static primitive types, if not the actual key tuple types
  keyTuple: Record<string, any>;
  // TODO: include schema, block/tx/event info?
};

export type BlockEventsToStorageOptions = {
  registerTableSchema: (data: StoredTableSchema) => Promise<void>;
  registerTableMetadata: (data: StoredTableMetadata) => Promise<void>;
  getTableSchema: (opts: Pick<StoredTableSchema, "namespace" | "name">) => Promise<StoredTableSchema | undefined>;
  getTableMetadata: (opts: Pick<StoredTableMetadata, "namespace" | "name">) => Promise<StoredTableMetadata | undefined>;
  setRecord: (opts: SetRecordOptions) => Promise<void>;
  setField: (opts: SetFieldOptions) => Promise<void>;
  deleteRecord: (opts: DeleteRecordOptions) => Promise<void>;
};

export function blockEventsToStorage({
  registerTableMetadata,
  registerTableSchema,
  getTableMetadata,
  getTableSchema,
  setRecord,
  setField,
  deleteRecord,
}: BlockEventsToStorageOptions): (block: BlockEvents) => Promise<void> {
  return async (block) => {
    // Find and register all new table schemas
    // Store schemas are immutable, so we can parallelize this
    await Promise.all(
      block.logs.map(async (log) => {
        if (log.eventName !== "StoreSetRecord") return;
        if (log.args.table !== schemaTableId.toHex()) return;

        const [tableForSchema, ...otherKeys] = log.args.key;
        if (otherKeys.length) {
          console.warn(
            "sync-store: registerSchema event is expected to have only one key in key tuple, but got multiple",
            event
          );
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
          console.warn(
            "sync-store: setMetadata event is expected to have only one key in key tuple, but got multiple",
            log
          );
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
        console.warn("sync-store: no table schema found for event, skipping", log);
        continue;
      }
      if (!tableMetadata) {
        console.warn("sync-store: no table metadata found for event, skipping", log);
        continue;
      }

      const keyTupleValues = decodeKeyTuple(tableSchema.schema.keySchema, log.args.key);
      const keyTuple = Object.fromEntries(keyTupleValues.map((value, i) => [tableMetadata.keyNames[i] ?? i, value]));

      if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
        const values = decodeRecord(tableSchema.schema.valueSchema, log.args.data);
        const record = Object.fromEntries(tableMetadata.valueNames.map((name, i) => [name, values[i]]));
        // TODO: decide if we should handle ephemeral records separately?
        //       they'll eventually be turned into "events", but unclear if that should translate to client storage operations
        await setRecord({ ...tableId, keyTuple, record });
      } else if (log.eventName === "StoreSetField") {
        const valueName = tableMetadata.valueNames[log.args.schemaIndex];
        const value = decodeField(
          schemaIndexToAbiType(tableSchema.schema.valueSchema, log.args.schemaIndex),
          log.args.data
        );
        await setField({ ...tableId, keyTuple, valueName, value });
      } else if (log.eventName === "StoreDeleteRecord") {
        await deleteRecord({ ...tableId, keyTuple });
      } else {
        console.warn("sync-store: unknown store event, skipping", log);
      }
    }
  };
}
