#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import Koa from "koa";
import cors from "@koa/cors";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { frontendEnvSchema, parseEnv } from "./parseEnv";
import { createQueryAdapter } from "../src/postgres/deprecated/createQueryAdapter";
import { apiRoutes } from "../src/postgres/apiRoutes";
import { registerSentryMiddlewares } from "../src/sentry";
import { healthcheck } from "../src/healthcheck";
import { helloWorld } from "../src/helloWorld";

const env = parseEnv(
  z.intersection(
    frontendEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
      SENTRY_DSN: z.string().optional(),
    })
  )
);

const database = postgres(env.DATABASE_URL, { prepare: false });

const server = new Koa();

if (env.SENTRY_DSN) {
  registerSentryMiddlewares(server);
}

server.use(cors());
server.use(healthcheck());
server.use(helloWorld());
server.use(apiRoutes(database));

server.use(
  createKoaMiddleware({
    prefix: "/trpc",
    router: createAppRouter(),
    createContext: async () => ({
      queryAdapter: await createQueryAdapter(drizzle(database)),
    }),
  })
);

server.listen({ host: env.HOST, port: env.PORT });
console.log(`postgres indexer frontend listening on http://${env.HOST}:${env.PORT}`);
