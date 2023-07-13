import { beforeEach, describe, expect, it } from "vitest";
import { createTable, destroy, getDatabase, getTable, mudIndexer, mudStoreTables } from "./sqlite";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createSqliteTable } from "./createSqliteTable";

describe("sqlite", () => {
  beforeEach(() => {
    destroy();
  });

  it("should create a database", async () => {
    const db = await getDatabase(4242, "0x0000000000000000000000000000000000000000");
    expect(db).toBeInstanceOf(BaseSQLiteDatabase);
    expect(db.select().from(mudStoreTables).all()).toMatchInlineSnapshot("[]");
    // TODO: test database to buffer via sql.js
  });

  it("should create a table", async () => {
    const db = await getDatabase(4242, "0x0000000000000000000000000000000000000000");

    expect(await getTable(db, "test", "users")).toBeNull();

    await createTable(db, {
      namespace: "test",
      name: "users",
      keyTupleSchema: { x: "uint8", y: "uint8" },
      valueSchema: { name: "string", addr: "address" },
      lastUpdatedBlockNumber: null,
    });

    const table = await getTable(db, "test", "users");
    expect(table).toMatchInlineSnapshot(`
      {
        "keyTupleSchema": {
          "x": "uint8",
          "y": "uint8",
        },
        "lastUpdatedBlockNumber": null,
        "name": "users",
        "namespace": "test",
        "valueSchema": {
          "addr": "address",
          "name": "string",
        },
      }
    `);
  });

  it("should create a row in a table", async () => {
    const db = await getDatabase(4242, "0x0000000000000000000000000000000000000000");
    const table = await createTable(db, {
      namespace: "test",
      name: "users",
      keyTupleSchema: { x: "uint8", y: "uint8" },
      valueSchema: { name: "string", addr: "address" },
      lastUpdatedBlockNumber: null,
    });

    const { table: sqliteTable } = createSqliteTable(table);
    db.insert(sqliteTable)
      .values([{ x: 1, y: 1, name: "User1" }])
      .run();

    expect(db.select().from(sqliteTable).all()).toMatchInlineSnapshot(`
      [
        {
          "__isDeleted": false,
          "__lastUpdatedBlockNumber": 0n,
          "addr": "0x0000000000000000000000000000000000000000",
          "name": "User1",
          "x": 1,
          "y": 1,
        },
      ]
    `);
  });

  it("should update singleton row", async () => {
    const db = await getDatabase(4242, "0x0000000000000000000000000000000000000000");

    db.insert(mudIndexer)
      .values({
        lastUpdatedBlockNumber: 1n,
        // __singleton: true,
      })
      .onConflictDoUpdate({
        target: mudIndexer.__singleton,
        set: {
          lastUpdatedBlockNumber: 1n,
        },
      })
      .run();

    expect(db.select().from(mudIndexer).all()).toMatchInlineSnapshot(`
      [
        {
          "__singleton": true,
          "lastError": null,
          "lastUpdatedBlockNumber": 1n,
        },
      ]
    `);

    db.insert(mudIndexer)
      .values({
        lastUpdatedBlockNumber: 2n,
        __singleton: true,
      })
      .onConflictDoUpdate({
        target: mudIndexer.__singleton,
        set: {
          lastUpdatedBlockNumber: 2n,
        },
      })
      .run();

    db.insert(mudIndexer)
      .values({
        lastUpdatedBlockNumber: 3n,
        __singleton: true,
      })
      .onConflictDoUpdate({
        target: mudIndexer.__singleton,
        set: {
          lastUpdatedBlockNumber: 3n,
        },
      })
      .run();

    expect(db.select().from(mudIndexer).all()).toMatchInlineSnapshot(`
      [
        {
          "__singleton": true,
          "lastError": null,
          "lastUpdatedBlockNumber": 3n,
        },
      ]
    `);
  });
});
