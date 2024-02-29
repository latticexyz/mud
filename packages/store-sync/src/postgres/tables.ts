import { boolean, index, pgSchema, primaryKey, varchar } from "drizzle-orm/pg-core";
import { transformSchemaName } from "./transformSchemaName";
import { asAddress, asBigInt, asHex, asNumber } from "./columnTypes";

const schemaName = transformSchemaName("mud");

/**
 * Singleton table for the state of the chain we're indexing
 */
const configTable = pgSchema(schemaName).table("config", {
  version: varchar("version").notNull(),
  chainId: asNumber("chain_id", "bigint").notNull().primaryKey(),
  blockNumber: asBigInt("block_number", "numeric").notNull(),
});

const recordsTable = pgSchema(schemaName).table(
  "records",
  {
    address: asAddress("address").notNull(),
    tableId: asHex("table_id").notNull(),
    /**
     * `keyBytes` is equivalent to `abi.encodePacked(bytes32[] keyTuple)`
     */
    keyBytes: asHex("key_bytes").notNull(),
    key0: asHex("key0"),
    key1: asHex("key1"),
    staticData: asHex("static_data"),
    encodedLengths: asHex("encoded_lengths"),
    dynamicData: asHex("dynamic_data"),
    isDeleted: boolean("is_deleted"),
    blockNumber: asBigInt("block_number", "numeric").notNull(),
    logIndex: asNumber("log_index", "numeric").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.address, table.tableId, table.keyBytes),
    key0Index: index("key0_index").on(table.address, table.tableId, table.key0),
    key1Index: index("key1_index").on(table.address, table.tableId, table.key1),
    // TODO: add indices for querying without table ID
    // TODO: add indices for querying multiple keys
  }),
);

export const tables = {
  configTable,
  recordsTable,
};
