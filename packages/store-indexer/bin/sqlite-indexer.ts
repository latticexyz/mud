import fs from "node:fs";
import { z } from "zod";
import cors from "cors";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createPublicClient, fallback, webSocket, http, Transport } from "viem";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createAppRouter } from "@latticexyz/store-sync/trpc-indexer";
import { chainState, schemaVersion, syncToSqlite } from "@latticexyz/store-sync/sqlite";
import { createStorageAdapter } from "../src/sqlite/createStorageAdapter";
import type { Chain } from "viem/chains";
import * as mudChains from "@latticexyz/common/chains";
import * as chains from "viem/chains";
import { isNotNull } from "@latticexyz/common/utils";

const possibleChains = Object.values({ ...mudChains, ...chains }) as Chain[];

// TODO: refine zod type to be either CHAIN_ID or RPC_HTTP_URL/RPC_WS_URL
const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive().optional(),
    RPC_HTTP_URL: z.string().optional(),
    RPC_WS_URL: z.string().optional(),
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

const chain = env.CHAIN_ID != null ? possibleChains.find((c) => c.id === env.CHAIN_ID) : undefined;
if (env.CHAIN_ID != null && !chain) {
  console.warn(`No chain found for chain ID ${env.CHAIN_ID}`);
}

const transports: Transport[] = [
  env.RPC_WS_URL ? webSocket(env.RPC_WS_URL) : null,
  env.RPC_HTTP_URL ? http(env.RPC_HTTP_URL) : null,
].filter(isNotNull);

const publicClient = createPublicClient({
  chain,
  transport: fallback(
    // If one or more RPC URLs are provided, we'll configure the transport with only those RPC URLs
    transports.length > 0
      ? transports
      : // Otherwise use the chain defaults
        [webSocket(), http()]
  ),
  pollingInterval: 1000,
});

// Fetch the chain ID from the RPC if no chain object was found for the provided chain ID.
// We do this to match the downstream logic, which also attempts to find the chain ID.
const chainId = chain?.id ?? (await publicClient.getChainId());

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

await syncToSqlite({
  database,
  publicClient,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
});

const server = createHTTPServer({
  middleware: cors(),
  router: createAppRouter(),
  createContext: async () => ({
    storageAdapter: await createStorageAdapter(database),
  }),
});

const { port } = server.listen(env.PORT);
console.log(`tRPC listening on http://127.0.0.1:${port}`);
