#!/usr/bin/env node
import "dotenv/config";
import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { http, createClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { AppRouter, createAppRouter } from "../src/createAppRouter";
import { parseEnv } from "./parseEnv";

const env = parseEnv();

const client = createClient({
  transport: http(env.RPC_HTTP_URL),
});

const faucetAccount = privateKeyToAccount(env.FAUCET_PRIVATE_KEY);

// @see https://fastify.dev/docs/latest/
const server = fastify({
  maxParamLength: 5000,
});

await server.register(import("@fastify/cors"));

// k8s healthchecks
server.get("/healthz", (req, res) => res.code(200).send());
server.get("/readyz", (req, res) => res.code(200).send());

// @see https://trpc.io/docs/server/adapters/fastify
server.register(fastifyTRPCPlugin<AppRouter>, {
  prefix: "/trpc",
  trpcOptions: {
    router: createAppRouter(),
    createContext: async () => ({
      client,
      faucetAccount,
      dripAmount: env.DRIP_AMOUNT_ETHER,
    }),
  },
});

await server.listen({ host: env.HOST, port: env.PORT });
console.log(`faucet server listening on http://${env.HOST}:${env.PORT}`);
