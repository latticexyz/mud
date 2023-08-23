import { bigint, integer, pgSchema, text } from "drizzle-orm/pg-core";
import { address, json } from "./columnTypes";
import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { transformSchemaName } from "./transformSchemaName";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createInternalTables() {
  const schema = pgSchema(transformSchemaName("__mud_internal"));
  return {
    chain: schema.table("chain", {
      schemaVersion: integer("schema_version").notNull().primaryKey(),
      chainId: integer("chain_id").notNull().primaryKey(),
      lastUpdatedBlockNumber: bigint("last_updated_block_number", { mode: "bigint" }),
      // TODO: last block hash?
      lastError: text("last_error"),
    }),
    tables: schema.table("tables", {
      schemaVersion: integer("schema_version").primaryKey(),
      id: text("id").notNull().primaryKey(),
      address: address("address").notNull(),
      tableId: text("table_id").notNull(),
      namespace: text("namespace").notNull(),
      name: text("name").notNull(),
      keySchema: json<Record<string, StaticAbiType>>("key_schema").notNull(),
      valueSchema: json<Record<string, StaticAbiType | DynamicAbiType>>("value_schema").notNull(),
      lastUpdatedBlockNumber: bigint("last_updated_block_number", { mode: "bigint" }),
      // TODO: last block hash?
      lastError: text("last_error"),
    }),
  };
}
