import { z } from "zod";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { latticeTestnet, latticeTestnet2 } from "@latticexyz/common/chains";
import { Chain, foundry } from "viem/chains";
import { createPublicClient, fallback, webSocket, http } from "viem";
import { createIndexer } from "../src/sqlite/createIndexer";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appRouter } from "../src";

const supportedChains: Chain[] = [foundry, latticeTestnet, latticeTestnet2];

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

// TODO: find a better intersection type between sql.js and better-sqlite3 instead of casting here
const database = drizzle(new Database(env.SQLITE_FILENAME), {
  // logger: new DefaultLogger(),
}) as any as BaseSQLiteDatabase<"sync", void>;

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
