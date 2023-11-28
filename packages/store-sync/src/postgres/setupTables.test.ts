import { beforeEach, describe, expect, it } from "vitest";
import { tables } from "./tables";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { DefaultLogger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { setupTables } from "./setupTables";

describe("setupTables", async () => {
  let db: PgDatabase<QueryResultHKT>;

  beforeEach(async () => {
    db = drizzle(postgres(process.env.DATABASE_URL!), {
      logger: new DefaultLogger(),
    });
  });

  describe("before running", () => {
    it("should be missing schemas", async () => {
      await expect(db.select().from(tables.chainTable)).rejects.toThrow(/relation "\w+mud.chain" does not exist/);
      await expect(db.select().from(tables.recordsTable)).rejects.toThrow(/relation "\w+mud.records" does not exist/);
    });
  });

  describe("after running", () => {
    beforeEach(async () => {
      const cleanUp = await setupTables(db, Object.values(tables));
      return cleanUp;
    });

    it("should have schemas", async () => {
      expect(await db.select().from(tables.chainTable)).toMatchInlineSnapshot("[]");
      expect(await db.select().from(tables.recordsTable)).toMatchInlineSnapshot("[]");
    });
  });
});
