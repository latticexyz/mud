import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { StorageAdapter } from "./common";

const t = initTRPC.context<{ storageAdapter: StorageAdapter }>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
