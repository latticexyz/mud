import fs from "node:fs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createPublicClient, fallback, webSocket, http } from "viem";
import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { chainState, schemaVersion } from "@latticexyz/store-sync/sqlite";
import { createIndexer } from "../src/sqlite/createIndexer";
import { createStorageAdapter } from "../src/sqlite/createStorageAdapter";
import type { Chain } from "viem/chains";
import * as mudChains from "@latticexyz/common/chains";
import * as chains from "viem/chains";

const possibleChains = Object.values({ ...mudChains, ...chains }) as Chain[];

const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
    START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
    MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
    PORT: z.coerce.number().positive().default(3001),
    SQLITE_FILENAME: z.string().default("indexer.db"),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const chain = possibleChains.find((c) => c.id === env.CHAIN_ID);
if (!chain) {
  throw new Error(`Chain ${env.CHAIN_ID} not found`);
}

const publicClient = createPublicClient({
  chain,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 1000,
});

const database = drizzle(new Database(env.SQLITE_FILENAME));

let startBlock = env.START_BLOCK;

// Resume from latest block stored in DB. This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
try {
  const currentChainStates = database.select().from(chainState).where(eq(chainState.chainId, chain.id)).all();
  // TODO: replace this type workaround with `noUncheckedIndexedAccess: true` when we can fix all the issues related (https://github.com/latticexyz/mud/issues/1212)
  const currentChainState: (typeof currentChainStates)[number] | undefined = currentChainStates[0];

  if (currentChainState != null) {
    if (currentChainState.schemaVersion != schemaVersion) {
      console.log(
        "schema version changed from",
        currentChainState.schemaVersion,
        "to",
        schemaVersion,
        "recreating database"
      );
      fs.truncateSync(env.SQLITE_FILENAME);
    } else if (currentChainState.lastUpdatedBlockNumber != null) {
      console.log("resuming from block number", currentChainState.lastUpdatedBlockNumber + 1n);
      startBlock = currentChainState.lastUpdatedBlockNumber + 1n;
    }
  }
} catch (error) {
  // ignore errors, this is optional
}

createIndexer({
  database,
  publicClient,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
});

const server = fastify({
  maxParamLength: 5000,
});

await server.register(import("@fastify/cors"));

// @see https://trpc.io/docs/server/adapters/fastify
server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: createAppRouter(),
    createContext: async () => ({
      storageAdapter: await createStorageAdapter(database),
    }),
  },
});

await server.listen({ port: env.PORT });
console.log(`indexer server listening on http://127.0.0.1:${env.PORT}`);
