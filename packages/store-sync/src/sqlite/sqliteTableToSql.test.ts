import { describe, it, expect } from "vitest";
import { sqliteTableToSql } from "./sqliteTableToSql";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

describe("sqliteTableToSql", () => {
  it("should return SQL to create table", async () => {
    const tableName = "some table";
    const table = sqliteTable(tableName, {
      x: integer("x").notNull().primaryKey(),
      y: integer("y").notNull().primaryKey(),
      name: text("name").notNull().default(""),
      blockNumber: blob("block_number", { mode: "bigint" }).notNull().default(1000n),
    });

    const sql = sqliteTableToSql(table);

    expect(sql).toMatchInlineSnapshot(
      // eslint-disable-next-line max-len
      '"create table if not exists \\"some table\\" (\\"x\\" integer not null, \\"y\\" integer not null, \\"name\\" text default \'\' not null, \\"block_number\\" blob default \'1000\' not null, constraint \\"some table__primaryKey\\" primary key (\\"x\\", \\"y\\"))"'
    );
  });

  it("should return SQL to create singleton table with no primary keys", async () => {
    const tableName = "some table";
    const table = sqliteTable(tableName, {
      name: text("name").notNull().default(""),
    });

    const sql = sqliteTableToSql(table);

    expect(sql).toMatchInlineSnapshot(
      '"create table if not exists \\"some table\\" (\\"name\\" text default \'\' not null)"'
    );
  });

  it("should generate correct SQL when keys != column names", async () => {
    const tableName = "some table";
    const table = sqliteTable(tableName, {
      camelCase: text("snake_case").notNull().default("").primaryKey(),
    });

    const sql = sqliteTableToSql(table);

    expect(sql).toMatchInlineSnapshot(
      '"create table if not exists \\"some table\\" (\\"snake_case\\" text default \'\' not null, constraint \\"some table__primaryKey\\" primary key (\\"snake_case\\"))"'
    );
  });
});
