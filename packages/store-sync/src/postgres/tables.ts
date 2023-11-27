import { boolean, index, pgSchema, primaryKey, text } from "drizzle-orm/pg-core";
import { transformSchemaName } from "./transformSchemaName";
import { asAddress, asBigInt, asHex, asNumber } from "./columnTypes";

export const schemaName = transformSchemaName("mud");

/**
 * Singleton table for the state of the chain we're indexing
 */
export const chainTable = pgSchema(schemaName).table("chain", {
  chainId: asNumber("chain_id", "bigint").notNull().primaryKey(),
  lastUpdatedBlockNumber: asBigInt("last_updated_block_number", "numeric"),
});

export const storesTable = pgSchema(schemaName).table("stores", {
  address: asAddress("address").notNull().primaryKey(),
  storeVersion: text("store_version").notNull(),
  lastUpdatedBlockNumber: asBigInt("last_updated_block_number", "numeric"),
});

export const recordsTable = pgSchema(schemaName).table(
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
    lastUpdatedBlockNumber: asBigInt("last_updated_block_number", "numeric"),
    staticData: asHex("static_data"),
    encodedLengths: asHex("encoded_lengths"),
    dynamicData: asHex("dynamic_data"),
    isDeleted: boolean("is_deleted"),
  },
  (table) => ({
    pk: primaryKey(table.address, table.tableId, table.keyBytes),
    key0Index: index("key0_index").on(table.address, table.tableId, table.key0),
    key1Index: index("key1_index").on(table.address, table.tableId, table.key1),
    // TODO: add indices for querying without table ID
    // TODO: add indices for querying multiple keys
  })
);
