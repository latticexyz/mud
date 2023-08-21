import { describe, it, expect } from "vitest";
import { tableToSql } from "./tableToSql";
import { bigint, integer, pgTable, text } from "drizzle-orm/pg-core";
import { Kysely, PostgresAdapter, DummyDriver, PostgresIntrospector, PostgresQueryCompiler } from "kysely";

// TODO: bring over sqlite tests

describe("tableToSql", () => {
  describe("postgres", () => {
    it("should return SQL to create table", async () => {
      const tableName = "some table";
      const table = pgTable(tableName, {
        x: integer("x").notNull().primaryKey(),
        y: integer("y").notNull().primaryKey(),
        name: text("name").notNull().default(""),
        blockNumber: bigint("block_number", { mode: "bigint" }).notNull().default(1000n),
      });

      const sql = tableToSql("postgres", table);

      expect(sql).toMatchInlineSnapshot(
        '"create table if not exists \\"some table\\" (\\"x\\" integer not null, \\"y\\" integer not null, \\"name\\" text default \'\' not null, \\"block_number\\" bigint default \'1000\' not null, constraint \\"some table__primaryKey\\" primary key (\\"x\\", \\"y\\"))"'
      );
    });

    it("should return SQL to create singleton table with no primary keys", async () => {
      const tableName = "some table";
      const table = pgTable(tableName, {
        name: text("name").notNull().default(""),
      });

      const sql = tableToSql("postgres", table);

      expect(sql).toMatchInlineSnapshot(
        '"create table if not exists \\"some table\\" (\\"name\\" text default \'\' not null)"'
      );
    });

    it("should generate correct SQL when keys != column names", async () => {
      const tableName = "some table";
      const table = pgTable(tableName, {
        camelCase: text("snake_case").notNull().default("").primaryKey(),
      });

      const sql = tableToSql("postgres", table);

      expect(sql).toMatchInlineSnapshot(
        '"create table if not exists \\"some table\\" (\\"snake_case\\" text default \'\' not null, constraint \\"some table__primaryKey\\" primary key (\\"snake_case\\"))"'
      );
    });
  });
});
