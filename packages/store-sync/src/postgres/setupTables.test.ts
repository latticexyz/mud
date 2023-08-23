import { beforeEach, describe, expect, it } from "vitest";
import { createInternalTables } from "./createInternalTables";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { DefaultLogger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { setupTables } from "./setupTables";

describe("setupTables", async () => {
  let db: PgDatabase<QueryResultHKT>;
  const getSchemaName = (schemaName: string): string => `${process.pid}_${process.env.VITEST_POOL_ID}__${schemaName}`;

  beforeEach(async () => {
    db = drizzle(postgres(process.env.DATABASE_URL!), {
      logger: new DefaultLogger(),
    });
  });

  it("should set up tables with schemas and clean up", async () => {
    const internalTables = createInternalTables(getSchemaName);

    await expect(db.select().from(internalTables.chain)).rejects.toThrow(
      /relation "\w+mud_internal.chain" does not exist/
    );
    await expect(db.select().from(internalTables.tables)).rejects.toThrow(
      /relation "\w+mud_internal.tables" does not exist/
    );

    const cleanUp = await setupTables(db, Object.values(internalTables));

    expect(await db.select().from(internalTables.chain)).toMatchInlineSnapshot("[]");
    expect(await db.select().from(internalTables.tables)).toMatchInlineSnapshot("[]");

    await cleanUp();

    await expect(db.select().from(internalTables.chain)).rejects.toThrow(
      /relation "\w+mud_internal.chain" does not exist/
    );
    await expect(db.select().from(internalTables.tables)).rejects.toThrow(
      /relation "\w+mud_internal.tables" does not exist/
    );
  });
});
