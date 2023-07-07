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

// TODO: change table schema/metadata APIs once we get both schema and field names in the same event

// TODO: export these from store or world
export const schemaTableId = new TableId("mudstore", "schema");
export const metadataTableId = new TableId("mudstore", "StoreMetadata");

// I don't love carrying all these types through. Ideally this should be the shape of the thing we want, rather than the specific return type from a function.
export type StoreEventsLog = GetLogsResult<StoreEventsAbi>[number];
export type BlockEvents = GroupLogsByBlockNumberResult<StoreEventsLog>[number];

export type StoredTable = {
  address: Address;
  namespace: string;
  name: string;
  // TODO: replace with named key tuples once we have on chain key tuple names
  // keyTuple: Record<string,StaticAbiType>;
  keyTuple: readonly StaticAbiType[];
  value: Record<string, SchemaAbiType>;
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
      keyTuple: Key<TConfig, TTable>;
      record: Value<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type SetFieldOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetField";
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

export type DeleteRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "DeleteRecord";
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
  registerTable: (data: StoredTable) => Promise<void>;
  getTable: (opts: Pick<StoredTable, "address" | "namespace" | "name">) => Promise<StoredTable | undefined>;
};

type TableNamespace = string;
type TableName = string;
type TableKey = `${Address}:${TableNamespace}:${TableName}`;

// hacky fix for schema registration + metadata events spanning multiple blocks
// TODO: remove this once schema registration+metadata is one event or tx
const visitedSchemas = new Map<TableKey, { address: Address; tableId: TableId; schema: TableSchema }>();
const visitedMetadata = new Map<
  TableKey,
  { address: Address; tableId: TableId; keyNames: readonly string[]; valueNames: readonly string[] }
>();

export function blockEventsToStorage<TConfig extends StoreConfig = StoreConfig>({
  registerTable,
  getTable,
}: BlockEventsToStorageOptions): (block: BlockEvents) => Promise<{
  blockNumber: BlockEvents["blockNumber"];
  blockHash: BlockEvents["blockHash"];
  operations: StorageOperation<TConfig>[];
}> {
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
    // TODO: rework contracts so schemas+tables are combined and immutable
    block.logs.forEach((log) => {
      if (log.eventName !== "StoreSetRecord") return;
      if (log.args.table !== metadataTableId.toHex()) return;

      const [tableForSchema, ...otherKeys] = log.args.key;
      if (otherKeys.length) {
        debug("setMetadata event is expected to have only one key in key tuple, but got multiple", log);
      }

      const tableId = TableId.fromHex(tableForSchema);
      const [tableName, abiEncodedFieldNames] = decodeRecord(
        // TODO: this is hardcoded for now while metadata is separate from table registration
        { staticFields: [], dynamicFields: ["string", "bytes"] },
        log.args.data
      );
      const valueNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames as Hex)[0];
      // TODO: add key names to table registration when we refactor it

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

    // register tables in parallel
    await Promise.all(
      newTableIds.map(async ({ address, tableId }) => {
        const schema = Array.from(visitedSchemas.values()).find(
          ({ address: schemaAddress, tableId: schemaTableId }) =>
            schemaAddress === address && schemaTableId.toHex() === tableId.toHex()
        );
        const metadata = Array.from(visitedMetadata.values()).find(
          ({ address: metadataAddress, tableId: metadataTableId }) =>
            metadataAddress === address && metadataTableId.toHex() === tableId.toHex()
        );
        if (!schema) {
          debug(`no schema registration found for table ${tableId.toString()} in block ${block.blockNumber}, skipping`);
          return;
        }
        if (!metadata) {
          debug(
            `no metadata registration found for table ${tableId.toString()} in block ${block.blockNumber}, skipping`
          );
          return;
        }

        const valueAbiTypes = [...schema.schema.valueSchema.staticFields, ...schema.schema.valueSchema.dynamicFields];

        const table: StoredTable = {
          address,
          namespace: schema.tableId.namespace,
          name: schema.tableId.name,
          keyTuple: schema.schema.keySchema.staticFields,
          value: Object.fromEntries(valueAbiTypes.map((abiType, i) => [metadata.valueNames[i], abiType])),
        };

        await registerTable(table);
      })
    );

    const tableIds = Array.from(
      new Set(
        block.logs.map((log) => ({
          address: log.address,
          tableId: TableId.fromHex(log.args.table),
        }))
      )
    );
    // TODO: combine these once we refactor table registration
    const tables = Object.fromEntries(
      await Promise.all(
        tableIds.map(async ({ address, tableId }) => [
          `${address}:${tableId.toHex()}`,
          await getTable({ address, ...tableId }),
        ])
      )
    ) as Record<Hex, StoredTable>;

    const operations = block.logs
      .map((log): StorageOperation<TConfig> | undefined => {
        const tableId = TableId.fromHex(log.args.table);
        const table = tables[`${log.address}:${log.args.table}`];
        if (!table) {
          debug("no table found for event, skipping", tableId.toString(), log);
          return;
        }

        const keyTupleValues = decodeKeyTuple({ staticFields: table.keyTuple, dynamicFields: [] }, log.args.key);
        // TODO: add key names once we register them on chain
        const keyTuple = Object.fromEntries(keyTupleValues.map((value, i) => [i, value])) as Key<
          TConfig,
          keyof TConfig["tables"]
        >;

        const valueAbiTypes = Object.values(table.value);
        const valueSchema = abiTypesToSchema(valueAbiTypes);
        const valueNames = Object.keys(table.value);

        if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
          const values = decodeRecord(valueSchema, log.args.data);
          const record = Object.fromEntries(valueNames.map((name, i) => [name, values[i]])) as Value<
            TConfig,
            keyof TConfig["tables"]
          >;
          // TODO: decide if we should handle ephemeral records separately?
          //       they'll eventually be turned into "events", but unclear if that should translate to client storage operations
          return {
            log,
            type: "SetRecord",
            ...tableId,
            keyTuple,
            record,
          };
        }

        if (log.eventName === "StoreSetField") {
          const valueName = valueNames[log.args.schemaIndex] as string & keyof Value<TConfig, keyof TConfig["tables"]>;
          const value = decodeField(valueAbiTypes[log.args.schemaIndex], log.args.data) as Value<
            TConfig,
            keyof TConfig["tables"]
          >[typeof valueName];
          return {
            log,
            type: "SetField",
            ...tableId,
            keyTuple,
            valueName,
            value,
          };
        }

        if (log.eventName === "StoreDeleteRecord") {
          return {
            log,
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
