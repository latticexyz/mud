import { beforeAll, beforeEach, describe, it } from "vitest";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { DefaultLogger, sql } from "drizzle-orm";
import {
  blockEventsToStorage,
  BlockEventsToStorageOptions,
  StoredTableSchema,
  StoredTableMetadata,
} from "@latticexyz/store-sync";
import { SchemaAbiType, schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type";

type StorageOperations = ReturnType<typeof blockEventsToStorage>;

/**
 * Idea:
 * - Users read data via views (or directly from tables), but not dynamic sql
 * - client defines views
 *   - if remote view: use materialized views on the indexer, propagate updates; later: only admin can create views, so views from the client are rejected if they don't exist yet
 *   - if local view: define view when starting up the client, rerun the view if a dependent table changes
 *
 * - might need a wrapper around insert (1. to match the interface of the sync stack and 2. to rerun views if tables change)
 */

const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

async function createDatabase(): Promise<SQLJsDatabase> {
  const SQL = await initSqlJs();
  const client = new SQL.Database();
  return drizzle(client, { logger: new DefaultLogger() });
}

function formatTableName({ namespace, name }: { namespace: string; name: string }): string {
  return `${namespace}_${name}`;
}

function abiTypeToSqliteType(abiType: SchemaAbiType): AnySQLiteColumnBuilder {
  const defaultValue = schemaAbiTypeToDefaultValue[abiType];
  switch (typeof defaultValue) {
    case "bigint":
      // TODO: need to hex encode bignumbers coming from the sync stream with the right size since they arrive as bigints
      return text;
    case "boolean":
      // TODO: need to encode bools as intexers
      return integer;
    case "number":
    // TODO: continue here
    default:
      throw new Error(`Type not compatible with sqlite: ${abiType} / ${typeof defaultValue}`);
  }
}

function mudSchemaToDrizzleSchem({ namespace, name, schema }: StoredTableSchema): any {
  // Turn schema into SQL to create a table with this schema

  // One column for each key
  // One column for each value
  const columns = {};

  for (const key of schema.keySchema.staticFields) {
  }

  return sqliteTable(formatTableName({ namespace, name }), columns, (table) =>
    // Primary key: composite of all keys
    ({})
  );
}

function drizzleSchemaToMigration(drizzleSchema: any): any {
  // Turn drizzle schema into corresponding SQL migration
  // This is exactly what drizzle-kit does, but unfortunately drizzle-kit is closed source
}

const options: BlockEventsToStorageOptions = {
  async registerTableSchema(schema) {
    // Store schema in the Schema table
    // Create a new table based on the schema
  },
  async registerTableMetadata(data) {
    // Rename the table columns with the data
  },
  async getTableSchema(opts) {
    // Return schema from the database
    return {} as StoredTableSchema;
  },
  async getTableMetadata(opts) {
    // Return metadata from the database
    return {} as StoredTableMetadata;
  },
};

describe("sqlite", () => {
  let db: SQLJsDatabase;

  beforeAll(async () => {
    db = await createDatabase();
  });

  beforeEach(async () => {
    db.run(sql`drop table if exists ${usersTable}`);

    db.run(sql`
		create table ${usersTable} (
			id integer primary key,
			name text not null
		)`);
  });

  it("should work", async () => {
    db.insert(usersTable)
      .values([{ id: 1, name: "User1" }])
      .run();

    const queryResult = db.select({ name: usersTable.name }).from(usersTable).get();

    console.log(queryResult);
  });

  it("should be performant", async () => {
    const NUM = 10_000;

    let time = Date.now();
    for (let i = 0; i < NUM; i++) {
      db.insert(usersTable)
        .values([{ name: String(i) }])
        .run();
    }
    console.log(`Time to insert ${NUM} items in separate transactions: ${Date.now() - time}`);

    time = Date.now();
    await db.transaction(async (tx) => {
      for (let i = 0; i < NUM; i++) {
        tx.insert(usersTable)
          .values([{ name: String(i) }])
          .run();
      }
    });

    console.log(`Time to insert ${NUM} items in one transactions: ${Date.now() - time}`);

    time = Date.now();
    const queryResult = db.select({ name: usersTable.name }).from(usersTable).all();
    console.log(`Time to select ${NUM * 2} items: ${Date.now() - time}`);

    console.log(queryResult);
  });
});
