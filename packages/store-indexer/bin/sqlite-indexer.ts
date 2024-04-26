#!/usr/bin/env node
import "dotenv/config";
import fs from "node:fs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createPublicClient, fallback, webSocket, http, Transport } from "viem";
import Koa from "koa";
import cors from "@koa/cors";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { chainState, schemaVersion, syncToSqlite } from "@latticexyz/store-sync/sqlite";
import { createQueryAdapter } from "../src/sqlite/createQueryAdapter";
import { isDefined } from "@latticexyz/common/utils";
import { combineLatest, filter, first } from "rxjs";
import { frontendEnvSchema, indexerEnvSchema, parseEnv } from "./parseEnv";
import { healthcheck } from "../src/koa-middleware/healthcheck";
import { helloWorld } from "../src/koa-middleware/helloWorld";
import { apiRoutes } from "../src/sqlite/apiRoutes";
import { sentry } from "../src/koa-middleware/sentry";
import { metrics } from "../src/koa-middleware/metrics";

const env = parseEnv(
  z.intersection(
    z.intersection(indexerEnvSchema, frontendEnvSchema),
    z.object({
      SQLITE_FILENAME: z.string().default("indexer.db"),
      SENTRY_DSN: z.string().optional(),
    }),
  ),
);

const transports: Transport[] = [
  // prefer WS when specified
  env.RPC_WS_URL ? webSocket(env.RPC_WS_URL) : undefined,
  // otherwise use or fallback to HTTP
  env.RPC_HTTP_URL ? http(env.RPC_HTTP_URL) : undefined,
].filter(isDefined);

const publicClient = createPublicClient({
  transport: fallback(transports),
  pollingInterval: env.POLLING_INTERVAL,
});

const chainId = await publicClient.getChainId();
const database = drizzle(new Database(env.SQLITE_FILENAME));

let startBlock = env.START_BLOCK;

async function getCurrentChainState(): Promise<
  | {
      schemaVersion: number;
      chainId: number;
      lastUpdatedBlockNumber: bigint | null;
      lastError: string | null;
    }
  | undefined
> {
  // This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
  try {
    const currentChainStates = database.select().from(chainState).where(eq(chainState.chainId, chainId)).all();
    // TODO: replace this type workaround with `noUncheckedIndexedAccess: true` when we can fix all the issues related (https://github.com/latticexyz/mud/issues/1212)
    const currentChainState: (typeof currentChainStates)[number] | undefined = currentChainStates[0];
    return currentChainState;
  } catch (error) {
    // ignore errors, this is optional
  }
}

async function getLatestStoredBlockNumber(): Promise<bigint | undefined> {
  const currentChainState = await getCurrentChainState();
  return currentChainState?.lastUpdatedBlockNumber ?? undefined;
}

const currentChainState = await getCurrentChainState();
if (currentChainState) {
  // Reset the db if the version changed
  if (currentChainState.schemaVersion != schemaVersion) {
    console.log(
      "schema version changed from",
      currentChainState.schemaVersion,
      "to",
      schemaVersion,
      "recreating database",
    );
    fs.truncateSync(env.SQLITE_FILENAME);
  } else if (currentChainState.lastUpdatedBlockNumber != null) {
    // Resume from latest block stored in DB. This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
    console.log("resuming from block number", currentChainState.lastUpdatedBlockNumber + 1n);
    startBlock = currentChainState.lastUpdatedBlockNumber + 1n;
  }
}

const { latestBlockNumber$, storedBlockLogs$ } = await syncToSqlite({
  database,
  publicClient,
  followBlockTag: env.FOLLOW_BLOCK_TAG,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
  address: env.STORE_ADDRESS,
});

let isCaughtUp = false;
combineLatest([latestBlockNumber$, storedBlockLogs$])
  .pipe(
    filter(
      ([latestBlockNumber, { blockNumber: lastBlockNumberProcessed }]) =>
        latestBlockNumber === lastBlockNumberProcessed,
    ),
    first(),
  )
  .subscribe(() => {
    isCaughtUp = true;
    console.log("all caught up");
  });

const server = new Koa();

if (env.SENTRY_DSN) {
  server.use(sentry(env.SENTRY_DSN));
}

server.use(cors());
server.use(
  healthcheck({
    isReady: () => isCaughtUp,
  }),
);
server.use(
  metrics({
    isHealthy: () => true,
    isReady: () => isCaughtUp,
    getLatestStoredBlockNumber,
    followBlockTag: env.FOLLOW_BLOCK_TAG,
  }),
);
server.use(helloWorld());
server.use(apiRoutes(database));

server.use(
  createKoaMiddleware({
    prefix: "/trpc",
    router: createAppRouter(),
    createContext: async () => ({
      queryAdapter: await createQueryAdapter(database),
    }),
  }),
);

server.listen({ host: env.HOST, port: env.PORT });
console.log(`sqlite indexer frontend listening on http://${env.HOST}:${env.PORT}`);
