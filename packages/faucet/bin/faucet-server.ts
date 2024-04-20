#!/usr/bin/env node
import "dotenv/config";
import Koa from "koa";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { healthcheck } from "../src/koa-middleware/healthcheck";
import { helloWorld } from "../src/koa-middleware/helloWorld";
import { apiRoutes } from "../src/apiRoutes";
import { http, createClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createAppRouter } from "../src/trpc/createAppRouter";
import { parseEnv } from "./parseEnv";

const env = parseEnv();

const client = createClient({
  transport: http(env.RPC_HTTP_URL),
});

const faucetAccount = privateKeyToAccount(env.FAUCET_PRIVATE_KEY);

const server = new Koa();

server.use(cors());
server.use(bodyParser());
server.use(healthcheck());
server.use(helloWorld());
server.use(apiRoutes());

server.use(
  createKoaMiddleware({
    prefix: "/trpc",
    router: createAppRouter(),
    createContext: async () => ({
      client,
      faucetAccount,
      dripAmount: env.DRIP_AMOUNT_ETHER,
      dev: env.DEV,
    }),
  }),
);

server.listen({ host: env.HOST, port: env.PORT });
console.log(`faucet server listening on http://${env.HOST}:${env.PORT}`);
