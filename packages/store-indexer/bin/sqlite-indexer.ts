import { z } from "zod";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { latticeTestnet } from "@latticexyz/common/chains";
import { Chain, foundry } from "viem/chains";
import { createPublicClient, fallback, webSocket, http } from "viem";
import { createIndexer } from "../src/sqlite/createIndexer";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appRouter } from "../src";

const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
    START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
    MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
    PORT: z.coerce.number().positive().default(3001),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

// TODO: find a better intersection type between sql.js and better-sqlite3 instead of casting here
// TODO: make DB filename configurable?
const database = drizzle(new Database("indexer.db"), {
  // logger: new DefaultLogger(),
}) as any as BaseSQLiteDatabase<"sync", void>;

const supportedChains: Chain[] = [foundry, latticeTestnet];
const chain = supportedChains.find((c) => c.id === env.CHAIN_ID);
if (!chain) {
  throw new Error(`Chain ${env.CHAIN_ID} not found`);
}

const publicClient = createPublicClient({
  chain,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 1000,
});

createIndexer({
  database,
  publicClient,
  startBlock: env.START_BLOCK,
  maxBlockRange: env.MAX_BLOCK_RANGE,
});

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext: () => ({
    database,
  }),
});

const { port } = server.listen(env.PORT);
console.log(`tRPC listening on http://127.0.0.1:${port}`);
