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
import { blockEventsToStorage } from "@latticexyz/store-sync";

export const supportedChains: MUDChain[] = [foundry, latticeTestnet];

const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
    // TODO: database config
  })
  .parse(process.env);

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
const startBlock = 0n;

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
  }),
  mergeMap(({ logs }) => from(groupLogsByBlockNumber(logs))),
  tap((blockLogs) => console.log("block logs", blockLogs))
);

blockLogs$
  .pipe(
    concatMap(
      blockEventsToStorage({
        async registerTableSchema({ namespace, name, schema }) {
          // TODO: insert schema + create DB table
          console.log("registered schema", `${namespace}:${name}`, schema);
        },
        async registerTableMetadata({ namespace, name, keyNames, valueNames }) {
          // TODO: ugh this is gonna be a pain
          console.log("registered metadata", `${namespace}:${name}`, valueNames);
        },
        async getTableSchema({ namespace, name }) {
          // TODO: fetch table schema from DB
          return undefined;
        },
        async getTableMetadata({ namespace, name }) {
          // TODO: fetch table metadata from DB
          return undefined;
        },
      })
    ),
    concatMap(async ({ blockNumber, blockHash, operations }) => {
      // TODO: do this in a DB tx
      for (const operation of operations) {
        if (operation.type === "SetRecord") {
          // TODO: store record
          // await storeCache.set(operation.namespace, operation.name, operation.keyTuple, operation.record);
          console.log("stored record", operation);
        } else if (operation.type === "SetField") {
          // TODO: update record
          // await storeCache.set(operation.namespace, operation.name, operation.keyTuple, {
          //   [operation.valueName]: operation.value,
          // });
          console.log("stored field", operation);
        } else if (operation.type === "DeleteRecord") {
          // TODO: delete reocrd
          // await storeCache.remove(operation.namespace, operation.name, operation.keyTuple);
          console.log("deleted record", operation);
        }
      }
    })
  )
  .subscribe();
