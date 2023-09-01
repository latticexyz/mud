import { DummyDriver, Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from "kysely";

export const pgDialect = new Kysely({
  dialect: {
    createAdapter: (): PostgresAdapter => new PostgresAdapter(),
    createDriver: (): DummyDriver => new DummyDriver(),
    createIntrospector: (db: Kysely<unknown>): PostgresIntrospector => new PostgresIntrospector(db),
    createQueryCompiler: (): PostgresQueryCompiler => new PostgresQueryCompiler(),
  },
});
