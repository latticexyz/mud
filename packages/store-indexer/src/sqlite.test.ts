import { beforeAll, beforeEach, describe, it } from "vitest";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { sqliteTable, integer, text, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { DefaultLogger, sql } from "drizzle-orm";
import { createSqliteTable } from "./createSqliteTable";

/**
 * Idea:
 * - Users read data via views (or directly from tables), but not dynamic sql
 * - client defines views
 *   - if remote view: use materialized views on the indexer, propagate updates; later: only admin can create views, so views from the client are rejected if they don't exist yet
 *   - if local view: define view when starting up the client, rerun the view if a dependent table changes
 *
 * - might need a wrapper around insert (1. to match the interface of the sync stack and 2. to rerun views if tables change)
 */

async function createDb(): Promise<SQLJsDatabase> {
  const SQL = await initSqlJs();
  const client = new SQL.Database();
  return drizzle(client /* { logger: new DefaultLogger() } */);
}

/**
 * Define a query/view that returns an rxjs object with updates if a table updates
 */
async function createReactiveView(): Promise<void> {
  // TODO
}

describe("sqlite", () => {
  let db: SQLJsDatabase;
  let usersTable: SQLiteTableWithColumns<any>;

  beforeEach(async () => {
    db = await createDb();

    const { table, createTableSql } = await createSqliteTable({
      namespace: "test",
      name: "users",
      keySchema: { id: "uint256" },
      valueSchema: { name: "string" },
    });

    db.run(createTableSql);

    usersTable = table;
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
        .values([{ id: i, name: String(i) }])
        .run();
    }
    console.log(`Time to insert ${NUM} items in separate transactions: ${Date.now() - time}`);

    time = Date.now();
    await db.transaction(async (tx) => {
      for (let i = 0; i < NUM; i++) {
        tx.insert(usersTable)
          .values([{ id: i + NUM, name: String(i) }])
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
