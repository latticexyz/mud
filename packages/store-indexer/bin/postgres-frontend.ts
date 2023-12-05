#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import postgres from "postgres";
import { frontendEnvSchema, parseEnv } from "./parseEnv";
import { sse } from "../src/postgres/sse";
import Koa from "koa";
import cors from "@koa/cors";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { createQueryAdapter } from "../src/postgres/createQueryAdapter";
import { helloWorld } from "../src/helloWorld";
import { healthcheck } from "../src/healthcheck";
import { drizzle } from "drizzle-orm/postgres-js";

const env = parseEnv(
  z.intersection(
    frontendEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
    })
  )
);

const database = postgres(env.DATABASE_URL);

const server = new Koa();
server.use(cors());
server.use(healthcheck());
server.use(helloWorld());

// SSE endpoints
server.use(sse(database));

// tRPC endpoints
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
