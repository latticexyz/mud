import { integer, pgSchema, text } from "drizzle-orm/pg-core";
import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { transformSchemaName } from "./transformSchemaName";
import { asAddress, asBigInt, asJson, asNumber } from "./columnTypes";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function buildInternalTables() {
  const schema = pgSchema(transformSchemaName("__mud_internal"));
  return {
    chain: schema.table("chain", {
      // TODO: change schema version to varchar/text?
      schemaVersion: integer("schema_version").notNull().primaryKey(),
      chainId: asNumber("chain_id", "bigint").notNull().primaryKey(),
      lastUpdatedBlockNumber: asBigInt("last_updated_block_number", "numeric"),
      // TODO: last block hash?
      lastError: text("last_error"),
    }),
    tables: schema.table("tables", {
      schemaVersion: integer("schema_version").primaryKey(),
      key: text("key").notNull().primaryKey(),
      address: asAddress("address").notNull(),
      tableId: text("table_id").notNull(),
      namespace: text("namespace").notNull(),
      name: text("name").notNull(),
      keySchema: asJson<Record<string, StaticAbiType>>("key_schema").notNull(),
      valueSchema: asJson<Record<string, StaticAbiType | DynamicAbiType>>("value_schema").notNull(),
      lastUpdatedBlockNumber: asBigInt("last_updated_block_number", "numeric"),
      // TODO: last block hash?
      lastError: text("last_error"),
    }),
  };
}
