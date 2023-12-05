import { Sql } from "postgres";
import Koa from "koa";
import cors from "@koa/cors";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { createQueryAdapter } from "./createQueryAdapter";
import { healthcheck } from "../healthcheck";
import { drizzle } from "drizzle-orm/postgres-js";

type CreateFrontendServerOptions = {
  database: Sql;
};

export function createFrontendServer({ database }: CreateFrontendServerOptions): Koa {
  const server = new Koa();
  server.use(cors());
  server.use(healthcheck());

  server.use(async (ctx, next) => {
    if (ctx.path === "/") {
      ctx.status = 200;
      ctx.body = "emit HelloWorld();";
      return;
    }
    await next();
  });

  server.use(
    createKoaMiddleware({
      prefix: "/trpc",
      router: createAppRouter(),
      createContext: async () => ({
        // TODO: update query adapter to take in postgres.Sql instead
        queryAdapter: await createQueryAdapter(drizzle(database)),
      }),
    })
  );

  return server;
}
