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
import { createTable, database, getTable } from "../src/fakeDatabase";

export const supportedChains: MUDChain[] = [foundry, latticeTestnet];

const env = z
  .object({
    CHAIN_ID: z.coerce.number().positive(),
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
const startBlock = 18958033n;

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
        async registerTable({ address, namespace, name, keyTuple, value }) {
          createTable(chain.id, address, {
            namespace,
            name,
            schema: { keyTuple, value },
            rows: [],
            lastBlockNumber: startBlock,
          });
          console.log("registered schema", `${namespace}:${name}`, keyTuple, value);
        },
        async getTable({ address, namespace, name }) {
          const table = getTable(chain.id, address, namespace, name);
          return table
            ? {
                address,
                namespace,
                name,
                keyTuple: table.schema.keyTuple,
                value: table.schema.value,
              }
            : undefined;
        },
      })
    ),
    concatMap(async ({ blockNumber, blockHash, operations }) => {
      // TODO: do this in a DB tx once we have a real DB
      for (const operation of operations) {
        const table = getTable(chain.id, operation.log.address, operation.namespace, operation.name);
        if (!table) {
          console.log(`table ${operation.namespace}:${operation.name} not found, skipping operation`, operation);
          continue;
        }

        const keyTuple = Object.values(operation.keyTuple);

        if (operation.type === "SetRecord") {
          table.lastBlockNumber = blockNumber;
          table.rows = [
            ...table.rows.filter((row) => row.keyTuple.join(":") !== keyTuple.join(":")),
            {
              keyTuple: Object.values(operation.keyTuple),
              value: operation.record,
            },
          ];
          console.log("stored record", operation);
        } else if (operation.type === "SetField") {
          const row = table.rows.find((row) => row.keyTuple.join(":") === keyTuple.join(":"));
          if (!row) {
            console.log(`row ${keyTuple.join(":")} not found for set field, skipping operation`, operation);
            continue;
          }
          table.lastBlockNumber = blockNumber;
          row.value = {
            ...row.value,
            [operation.valueName]: operation.value,
          };
          console.log("stored field", operation);
        } else if (operation.type === "DeleteRecord") {
          table.lastBlockNumber = blockNumber;
          table.rows = table.rows.filter((row) => row.keyTuple.join(":") !== keyTuple.join(":"));
          console.log("deleted record", operation);
        }
      }
    })
  )
  .subscribe();
