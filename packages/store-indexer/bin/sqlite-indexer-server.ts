import { z } from "zod";
import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
import { foundry } from "@wagmi/chains";
import { createPublicClient, fallback, http, webSocket } from "viem";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { concatMap, filter, from, map, mergeMap, tap } from "rxjs";
import { storeEventsAbi } from "@latticexyz/store";
import { blockLogsToSqlite } from "../src/sqlite/blockLogsToSqlite";
import { getDatabase } from "../src/sqlite/getDatabase";

// TODO: align shared types (e.g. table, key+value schema)

export const supportedChains: MUDChain[] = [foundry, latticeTestnet];

const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
    START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
    MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
    // TODO: database config
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const chain = supportedChains.find((c) => c.id === env.CHAIN_ID);
if (!chain) {
  throw new Error(`Chain ${env.CHAIN_ID} not found`);
}

const publicClient = createPublicClient({
  chain,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 1000,
});

// TODO: fetch the last updated block from the DB
const startBlock = env.START_BLOCK;

const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number)
);

const blockLogs$ = latestBlockNumber$.pipe(
  tap((latestBlockNumber) => console.log("latest block number", latestBlockNumber)),
  map((latestBlockNumber) => ({ startBlock, endBlock: latestBlockNumber })),
  blockRangeToLogs({
    publicClient,
    events: storeEventsAbi,
    maxBlockRange: env.MAX_BLOCK_RANGE,
  }),
  tap(({ fromBlock, toBlock, logs }) => {
    console.log("found", logs.length, "logs for block", fromBlock, "-", toBlock);
    logs.forEach((log) => {
      // console.log("table", log.blockNumber, TableId.fromHex(log.args.table));
    });
  }),
  mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock)))
  // tap((blockLogs) => console.log("block logs", blockLogs))
);

blockLogs$
  .pipe(
    concatMap(blockLogsToSqlite({ database: await getDatabase(), publicClient })),
    tap(({ blockNumber, operations }) => {
      console.log("stored", operations.length, "operations for block", blockNumber);
    })
  )
  .subscribe();
