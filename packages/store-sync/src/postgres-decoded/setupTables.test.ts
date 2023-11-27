import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildInternalTables } from "./buildInternalTables";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { DefaultLogger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { setupTables } from "./setupTables";
import * as transformSchemaNameExports from "./transformSchemaName";

vi.spyOn(transformSchemaNameExports, "transformSchemaName").mockImplementation(
  (schemaName) => `${process.pid}_${process.env.VITEST_POOL_ID}__${schemaName}`
);

describe("setupTables", async () => {
  let db: PgDatabase<QueryResultHKT>;
  const internalTables = buildInternalTables();

  beforeEach(async () => {
    db = drizzle(postgres(process.env.DATABASE_URL!), {
      logger: new DefaultLogger(),
    });
  });

  describe("before running", () => {
    it("should be missing schemas", async () => {
      await expect(db.select().from(internalTables.chain)).rejects.toThrow(
        /relation "\w+mud_internal.chain" does not exist/
      );
      await expect(db.select().from(internalTables.tables)).rejects.toThrow(
        /relation "\w+mud_internal.tables" does not exist/
      );
    });
  });

  describe("after running", () => {
    beforeEach(async () => {
      const cleanUp = await setupTables(db, Object.values(internalTables));
      return cleanUp;
    });

    it("should have schemas", async () => {
      expect(await db.select().from(internalTables.chain)).toMatchInlineSnapshot("[]");
      expect(await db.select().from(internalTables.tables)).toMatchInlineSnapshot("[]");
    });
  });
});
