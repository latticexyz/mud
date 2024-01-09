#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { frontendEnvSchema, parseEnv } from "./parseEnv";
import { createQueryAdapter } from "../src/postgres/deprecated/createQueryAdapter";
import { apiRoutes } from "../src/postgres/apiRoutes";
import { registerSentryMiddlewares } from "../src/sentry";

const env = parseEnv(
  z.intersection(
    frontendEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
    })
  )
);

const database = postgres(env.DATABASE_URL, { prepare: false });

const server = new Koa();

if (process.env.SENTRY_DSN) {
  registerSentryMiddlewares(server, process.env.SENTRY_DSN);
}

server.use(cors());
server.use(apiRoutes(database));

const router = new Router();

router.get("/", (ctx) => {
  ctx.body = "emit HelloWorld();";
});

// k8s healthchecks
router.get("/healthz", (ctx) => {
  ctx.status = 200;
});
router.get("/readyz", (ctx) => {
  ctx.status = 200;
});

server.use(router.routes());
server.use(router.allowedMethods());

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
