import { initTRPC } from "@trpc/server";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import superjson from "superjson";

const t = initTRPC.context<{ database: BaseSQLiteDatabase<"sync", void> }>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
