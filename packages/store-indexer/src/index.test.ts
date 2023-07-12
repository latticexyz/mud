import { beforeEach, describe, expect, it } from "vitest";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";
import { createSqliteTable } from "./createSqliteTable";
import { sqliteTableToSql } from "./sqliteTableToSql";

async function createDb(): Promise<SQLJsDatabase> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  return drizzle(db);
}

describe("sqlite", () => {
  let db: SQLJsDatabase;
  let usersTable: SQLiteTableWithColumns<any>;

  beforeEach(async () => {
    db = await createDb();

    const { tableName, table } = createSqliteTable({
      namespace: "test",
      name: "users",
      keyTupleSchema: { x: "uint32", y: "uint32" },
      valueSchema: { name: "string", addr: "address" },
    });

    db.run(sql.raw(sqliteTableToSql(tableName, table)));

    usersTable = table;
  });

  it("should work", async () => {
    db.insert(usersTable)
      .values([{ x: 1, y: 1, name: "User1" }])
      .run();

    const queryResult = db.select().from(usersTable).where(eq(usersTable.name, "User1")).all();

    expect(queryResult).toMatchInlineSnapshot(`
      [
        {
          "addr": "0x0000000000000000000000000000000000000000",
          "name": "User1",
          "x": 1,
          "y": 1,
        },
      ]
    `);
  });

  // TODO: convert this to a benchmark test https://vitest.dev/guide/features.html#benchmarking-experimental

  it("should be performant", async () => {
    const NUM = 10_000;

    let time = Date.now();
    for (let i = 0; i < NUM; i++) {
      db.insert(usersTable)
        .values([{ x: i, y: i, name: String(i) }])
        .run();
    }
    console.log(`Time to insert ${NUM} items in separate transactions: ${Date.now() - time}`);

    time = Date.now();
    await db.transaction(async (tx) => {
      for (let i = 0; i < NUM; i++) {
        tx.insert(usersTable)
          .values([{ x: i + NUM, y: i + NUM, name: String(i) }])
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
