import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { address, asHex, json } from "./columnTypes";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";

export const chainState = sqliteTable("__chainState", {
  schemaVersion: integer("schema_version").notNull().primaryKey(),
  chainId: integer("chain_id").notNull().primaryKey(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export const mudStoreTables = sqliteTable("__mudStoreTables", {
  schemaVersion: integer("schema_version").primaryKey(),
  id: text("id").notNull().primaryKey(),
  address: address("address").notNull(),
  tableId: asHex("table_id").notNull(),
  namespace: text("namespace").notNull(),
  name: text("name").notNull(),
  keySchema: json<KeySchema>("key_schema").notNull(),
  valueSchema: json<ValueSchema>("value_schema").notNull(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});
