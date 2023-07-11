import { describe, expect, it } from "vitest";
import { getDatabase, mudStoreTables } from "./sqlite";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

describe("sqlite", () => {
  it("should create a database", async () => {
    const db = await getDatabase(4242, "0x0000000000000000000000000000000000000000");
    expect(db).toBeInstanceOf(BaseSQLiteDatabase);
    expect(db.select().from(mudStoreTables).all()).toMatchInlineSnapshot("[]");
    // TODO: test database to buffer via sql.js
  });
});
