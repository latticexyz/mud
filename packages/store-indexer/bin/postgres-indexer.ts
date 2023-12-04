#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createPublicClient, fallback, webSocket, http, Transport } from "viem";
import { isDefined } from "@latticexyz/common/utils";
import { combineLatest, filter, first } from "rxjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cleanDatabase, createStorageAdapter, shouldCleanDatabase } from "@latticexyz/store-sync/postgres";
import { createStoreSync } from "@latticexyz/store-sync";
import { indexerEnvSchema, parseEnv } from "./parseEnv";

const env = parseEnv(
  z.intersection(
    indexerEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
      HEALTHCHECK_HOST: z.string().optional(),
      HEALTHCHECK_PORT: z.coerce.number().optional(),
    })
  )
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
const database = drizzle(postgres(env.DATABASE_URL));

if (await shouldCleanDatabase(database, chainId)) {
  console.log("outdated database detected, clearing data to start fresh");
  cleanDatabase(database);
}

const { storageAdapter, tables } = await createStorageAdapter({ database, publicClient });

let startBlock = env.START_BLOCK;

// Resume from latest block stored in DB. This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
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

  if (chainState?.lastUpdatedBlockNumber != null) {
    startBlock = chainState.lastUpdatedBlockNumber + 1n;
    console.log("resuming from block number", startBlock);
  }
} catch (error) {
  // ignore errors for now
}

const { latestBlockNumber$, storedBlockLogs$ } = await createStoreSync({
  storageAdapter,
  publicClient,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
  address: env.STORE_ADDRESS,
});

storedBlockLogs$.subscribe();

let isCaughtUp = false;
combineLatest([latestBlockNumber$, storedBlockLogs$])
  .pipe(
    filter(
      ([latestBlockNumber, { blockNumber: lastBlockNumberProcessed }]) => latestBlockNumber === lastBlockNumberProcessed
    ),
    first()
  )
  .subscribe(() => {
    isCaughtUp = true;
    console.log("all caught up");
  });

if (env.HEALTHCHECK_HOST != null || env.HEALTHCHECK_PORT != null) {
  const { default: fastify } = await import("fastify");

  const server = fastify();

  // k8s healthchecks
  server.get("/healthz", (req, res) => res.code(200).send());
  server.get("/readyz", (req, res) => (isCaughtUp ? res.code(200).send("ready") : res.code(424).send("backfilling")));

  server.listen({ host: env.HEALTHCHECK_HOST, port: env.HEALTHCHECK_PORT }, (error, address) => {
    console.log(`postgres indexer healthcheck server listening on ${address}`);
  });
}
