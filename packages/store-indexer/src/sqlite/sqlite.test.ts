import { beforeEach, describe, expect, it } from "vitest";
import { chainState, createTable, destroy, getDatabase, getInternalDatabase, getTable, mudStoreTables } from "./sqlite";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createSqliteTable } from "./createSqliteTable";
import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type";
import { eq } from "drizzle-orm";

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
      .values({
        x: 1,
        y: 1,
        name: "User1",
        addr: schemaAbiTypeToDefaultValue["address"],
        __lastUpdatedBlockNumber: 0n,
        __isDeleted: false,
      })
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
    const internalDb = await getInternalDatabase();

    internalDb
      .insert(chainState)
      .values({
        chainId: 4242,
        lastUpdatedBlockNumber: 1n,
      })
      .onConflictDoUpdate({
        target: chainState.chainId,
        set: {
          lastUpdatedBlockNumber: 1n,
        },
      })
      .run();

    expect(internalDb.select().from(chainState).all()).toMatchInlineSnapshot(`
      [
        {
          "chainId": 4242,
          "lastError": null,
          "lastUpdatedBlockNumber": 1n,
        },
      ]
    `);

    internalDb
      .insert(chainState)
      .values({
        chainId: 4242,
        lastUpdatedBlockNumber: 2n,
      })
      .onConflictDoUpdate({
        target: chainState.chainId,
        set: {
          lastUpdatedBlockNumber: 2n,
        },
      })
      .run();

    internalDb
      .insert(chainState)
      .values({
        chainId: 4242,
        lastUpdatedBlockNumber: 3n,
      })
      .onConflictDoUpdate({
        target: chainState.chainId,
        set: {
          lastUpdatedBlockNumber: 3n,
        },
      })
      .run();

    expect(internalDb.select().from(chainState).all()).toMatchInlineSnapshot(`
      [
        {
          "chainId": 4242,
          "lastError": null,
          "lastUpdatedBlockNumber": 3n,
        },
      ]
    `);
  });
});
