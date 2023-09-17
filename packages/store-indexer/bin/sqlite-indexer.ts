import fs from "node:fs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createPublicClient, fallback, webSocket, http, Transport } from "viem";
import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { AppRouter, createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { chainState, schemaVersion, syncToSqlite } from "@latticexyz/store-sync/sqlite";
import { createQueryAdapter } from "../src/sqlite/createQueryAdapter";
import { isDefined } from "@latticexyz/common/utils";
import { combineLatest, filter, first } from "rxjs";

const env = z
  .intersection(
    z.object({
      HOST: z.string().default("0.0.0.0"),
      PORT: z.coerce.number().positive().default(3001),
      SQLITE_FILENAME: z.string().default("indexer.db"),
      START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
      MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
      POLLING_INTERVAL: z.coerce.number().positive().default(1000),
    }),
    z
      .object({
        RPC_HTTP_URL: z.string(),
        RPC_WS_URL: z.string(),
      })
      .partial()
      .refine((values) => Object.values(values).some(isDefined))
  )
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

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

// Resume from latest block stored in DB. This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
try {
  const currentChainStates = database.select().from(chainState).where(eq(chainState.chainId, chainId)).all();
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

const { latestBlockNumber$, storedBlockLogs$ } = await syncToSqlite({
  database,
  publicClient,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
});

combineLatest([latestBlockNumber$, storedBlockLogs$])
  .pipe(
    filter(
      ([latestBlockNumber, { blockNumber: lastBlockNumberProcessed }]) => latestBlockNumber === lastBlockNumberProcessed
    ),
    first()
  )
  .subscribe(() => {
    console.log("all caught up");
  });

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
      queryAdapter: await createQueryAdapter(database),
    }),
  },
});

await server.listen({ host: env.HOST, port: env.PORT });
console.log(`indexer server listening on http://${env.HOST}:${env.PORT}`);
