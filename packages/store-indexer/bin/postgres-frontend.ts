#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import postgres from "postgres";
import { frontendEnvSchema, parseEnv } from "./parseEnv";
import { createFrontendServer } from "../src/postgres/createFrontendServer";

const env = parseEnv(
  z.intersection(
    frontendEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
    })
  )
);

const database = postgres(env.DATABASE_URL);
const server = createFrontendServer({ database });

server.listen({ host: env.HOST, port: env.PORT });
console.log(`postgres indexer frontend listening on http://${env.HOST}:${env.PORT}`);
