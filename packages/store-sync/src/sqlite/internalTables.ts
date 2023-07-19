import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { address, json } from "./columnTypes";

export const chainState = sqliteTable("__chainState", {
  indexerVersion: integer("indexer_version").notNull().primaryKey(),
  chainId: integer("chainId").notNull().primaryKey(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export const mudStoreTables = sqliteTable("__mudStoreTables", {
  indexerVersion: text("indexer_version").primaryKey(),
  id: text("id").notNull().primaryKey(),
  address: address("address").notNull(),
  tableId: text("table_id").notNull(),
  namespace: text("namespace").notNull(),
  name: text("name").notNull(),
  keySchema: json("key_schema").notNull(),
  valueSchema: json("value_schema").notNull(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});
