#!/usr/bin/env node

import { z } from "zod";
import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { ClientConfig, http, parseEther, isHex, createClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { AppRouter, createAppRouter } from "../src/createAppRouter";
import { getChainId } from "viem/actions";

// TODO: refine zod type to be either CHAIN_ID or RPC_HTTP_URL/RPC_WS_URL
const env = z
  .object({
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().positive().default(3002),
    RPC_HTTP_URL: z.string(),
    FAUCET_PRIVATE_KEY: z.string().refine(isHex),
    DRIP_AMOUNT_ETHER: z
      .string()
      .default("1")
      .transform((ether) => parseEther(ether)),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const clientOptions = {
  transport: http(env.RPC_HTTP_URL),
} as const satisfies ClientConfig;

const chainId = await getChainId(createClient(clientOptions));
const client = createClient({
  ...clientOptions,
  // TODO: since we have the RPC URL defined in the transport, and the chain ID, why do we need to specify a chain here?
  chain: {
    id: chainId,
    name: "unknown",
    network: "unknown",
    nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
    rpcUrls: {
      default: { http: [env.RPC_HTTP_URL] },
      public: { http: [env.RPC_HTTP_URL] },
    },
  },
});

const faucetAccount = privateKeyToAccount(env.FAUCET_PRIVATE_KEY);

// @see https://fastify.dev/docs/latest/
const server = fastify({
  maxParamLength: 5000,
});

await server.register(import("@fastify/cors"));

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
