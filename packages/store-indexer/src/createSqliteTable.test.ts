import { describe, it, expect } from "vitest";
import { createSqliteTable } from "./createSqliteTable";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";

describe("createSqliteTable", () => {
  it("should return raw SQL", async () => {
    const sqliteDialect = new SQLiteSyncDialect();

    const { table, createTableSql } = await createSqliteTable({
      namespace: "test",
      name: "users",
      keySchema: { id: "uint256" },
      valueSchema: { name: "string" },
    });

    expect(sqliteDialect.sqlToQuery(createTableSql)).toMatchInlineSnapshot(`
      {
        "params": [],
        "sql": "CREATE TABLE [test:users] (
      id blob NOT NULL DEFAULT \\"'0'\\",
      name text NOT NULL DEFAULT \\"''\\",
      PRIMARY KEY(id)
      )",
      }
    `);
  });
});
