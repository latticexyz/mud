#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { combineLatest, filter, first } from "rxjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cleanDatabase, createStorageAdapter, shouldCleanDatabase } from "@latticexyz/store-sync/postgres";
import { createStoreSync } from "@latticexyz/store-sync";
import { indexerEnvSchema, parseEnv } from "./parseEnv";
import { getClientOptions } from "./getClientOptions";
import { getBlock, getChainId } from "viem/actions";
import { getRpcClient } from "@latticexyz/block-logs-stream";

const env = parseEnv(
  z.intersection(
    indexerEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
      HEALTHCHECK_HOST: z.string().optional(),
      HEALTHCHECK_PORT: z.coerce.number().optional(),
    }),
  ),
);

const clientOptions = await getClientOptions(env);

const chainId = await getChainId(getRpcClient(clientOptions));
const database = drizzle(postgres(env.DATABASE_URL, { prepare: false }));

if (await shouldCleanDatabase(database, chainId)) {
  console.log("outdated database detected, clearing data to start fresh");
  await cleanDatabase(database);
}

const { storageAdapter, tables } = await createStorageAdapter({ ...clientOptions, database });

let startBlock = env.START_BLOCK;

async function getLatestStoredBlockNumber(): Promise<bigint | undefined> {
  // Fetch latest block stored in DB. This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
  // TODO: query if the DB exists instead of try/catch
  try {
    const chainState = await database
      .select()
      .from(tables.configTable)
      .where(eq(tables.configTable.chainId, chainId))
      .limit(1)
      .execute()
      // Get the first record in a way that returns a possible `undefined`
      // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
      .then((rows) => rows.find(() => true));

    return chainState?.blockNumber;
  } catch (error) {
    // ignore errors for now
  }
}

async function getDistanceFromFollowBlock(): Promise<bigint> {
  const [latestStoredBlockNumber, latestFollowBlock] = await Promise.all([
    getLatestStoredBlockNumber(),
    getBlock(getRpcClient(clientOptions), { blockTag: env.FOLLOW_BLOCK_TAG }),
  ]);
  return latestFollowBlock.number - (latestStoredBlockNumber ?? -1n);
}

const latestStoredBlockNumber = await getLatestStoredBlockNumber();
if (latestStoredBlockNumber != null) {
  startBlock = latestStoredBlockNumber + 1n;
  console.log("resuming from block number", startBlock);
}

const { latestBlockNumber$, storedBlockLogs$ } = await createStoreSync({
  ...clientOptions,
  storageAdapter,
  followBlockTag: env.FOLLOW_BLOCK_TAG,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
  address: env.STORE_ADDRESS,
});

storedBlockLogs$.subscribe();

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

if (env.HEALTHCHECK_HOST != null || env.HEALTHCHECK_PORT != null) {
  const { default: Koa } = await import("koa");
  const { default: cors } = await import("@koa/cors");
  const { healthcheck } = await import("../koa-middleware/healthcheck");
  const { metrics } = await import("../koa-middleware/metrics");
  const { helloWorld } = await import("../koa-middleware/helloWorld");

  const server = new Koa();

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
      getDistanceFromFollowBlock,
      followBlockTag: env.FOLLOW_BLOCK_TAG,
    }),
  );
  server.use(helloWorld());

  server.listen({ host: env.HEALTHCHECK_HOST, port: env.HEALTHCHECK_PORT });
  console.log(
    `postgres indexer healthcheck server listening on http://${env.HEALTHCHECK_HOST}:${env.HEALTHCHECK_PORT}`,
  );
}
