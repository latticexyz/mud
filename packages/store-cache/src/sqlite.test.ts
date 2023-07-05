import { describe, it } from "vitest";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { DefaultLogger, sql } from "drizzle-orm";

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

async function createDb(): Promise<SQLJsDatabase> {
  const SQL = await initSqlJs();
  const client = new SQL.Database();
  return drizzle(client, { logger: new DefaultLogger() });
}

/**
 * Input: MUD schema
 * Output: sql to run to create the table, and drizzle schema object
 */
async function createTableFromSchema(): Promise<void> {
  // TODO
}

/**
 * Define a query/view that returns an rxjs object with updates if a table updates
 */
async function createReactiveView(): Promise<void> {
  // TODO
}

describe("sqlite", () => {
  it("should work", async () => {
    const db = await createDb();

    // Create table
    db.run(sql`
		create table ${usersTable} (
			id integer primary key,
			name text not null
		)`);

    db.update(usersTable).set({ id: 1, name: "User1" });

    // const tx = db
    //   .insert(usersTable)
    //   .values([{ id: 1, name: "User1" }])
    //   .run();
    // console.log(tx);

    const queryResult = db.select({ name: usersTable.name }).from(usersTable).get();
    console.log(queryResult);
  });
});
