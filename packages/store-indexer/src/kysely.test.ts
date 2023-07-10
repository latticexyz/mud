import { beforeEach, describe, it, expect } from "vitest";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { DefaultLogger, sql } from "drizzle-orm";
import { Kysely, SqliteDialect, SqliteDatabase, SqliteStatement } from "kysely";
import sqlite from "better-sqlite3";
import { fromBytes } from "viem";

type SchemasTable = {
  tableNamespace: string;
  tableName: string;
  // TODO: decide if we need this or can just stash it as a json string
  keyNames: string[];
  keyTypes: string[];
  fieldNames: string[];
  fieldTypes: string[];
};

type Database = {
  schemas: SchemasTable;
  [key: string]: unknown;
};

describe("sqlite", () => {
  let db: Kysely<Database>;

  beforeEach(async () => {
    const sql = await initSqlJs();
    const sqlDb = new sql.Database();

    db = new Kysely<Database>({
      dialect: new SqliteDialect({
        database: {
          close: (): void => sqlDb.close(),
          prepare: (sql): SqliteStatement => {
            if (/;/.test(sql)) {
              // Not sure what to do with `reader` for multiple queries, so reject
              throw new Error("Only one query supported");
            }

            return {
              // TODO: better way to detect if this is a select statement
              reader: /select\s/i.test(sql),
              all: (params) => {
                const results = sqlDb.exec(sql, params as any[]);
                if (results.length > 1) {
                  // Not sure what to do with `reader` for multiple queries, so reject
                  throw new Error("Only one query supported");
                }

                const { columns, values: rows } = results[0];
                return rows.map((values) => Object.fromEntries(values.map((value, i) => [columns[i], value])));
              },
              run: (params) => {
                // console.log(fromBytes(sqlDb.export(), "string"));
                const results = sqlDb.exec(sql, params as any[]);
                if (results.length > 1) {
                  // Not sure what to do with `reader` for multiple queries, so reject
                  throw new Error("Only one query supported");
                }

                // console.log("run results", JSON.stringify(results));
                // console.log(fromBytes(sqlDb.export(), "string"));
                return {
                  changes: sqlDb.getRowsModified(),
                  // TODO: figure out how to return the last insert id
                  lastInsertRowid: 0,
                };
              },
            } as SqliteStatement;
          },
        },
      }),
    });
  });

  it("should work", async () => {
    await db.schema
      .createTable("users")
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("name", "text")
      .execute();

    const result = await db.insertInto("users").values({ id: 1000, name: "User1" }).execute();
    expect(result).toMatchInlineSnapshot(`
      [
        InsertResult {
          "insertId": 0n,
          "numInsertedOrUpdatedRows": 1n,
        },
      ]
    `);

    const rows = await db.selectFrom("users").selectAll().execute();

    expect(rows).toHaveLength(1);
    expect(rows).toMatchInlineSnapshot(`
      [
        {
          "id": 1000,
          "name": "User1",
        },
      ]
    `);
  });
});
