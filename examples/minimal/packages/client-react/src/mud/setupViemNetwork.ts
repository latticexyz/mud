import { PublicClient, Transport, Chain, Hex, Log } from "viem";
import { TableSchema } from "@latticexyz/protocol-parser";
import {
  createBlockEventsStream,
  createBlockNumberStream,
  createBlockStream,
  getLogs,
} from "@latticexyz/block-events-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import mudConfig from "contracts/mud.config";
import * as devObservables from "@latticexyz/network/dev";
import { blockEventsToStorage } from "@latticexyz/store-sync";
import {
  catchError,
  concatMap,
  delay,
  delayWhen,
  exhaustMap,
  filter,
  from,
  map,
  of,
  retry,
  retryWhen,
  scan,
  startWith,
  switchMap,
  tap,
  throwError,
  timer,
} from "rxjs";
import { isNonPendingBlock, bigIntMin } from "@latticexyz/block-events-stream";

class BlockRangeError extends Error {
  fromBlock: bigint;
  toBlock: bigint;
  constructor(opts: { fromBlock: bigint; toBlock: bigint; message: string }) {
    super(opts.message);
    this.name = "BlockRangeError";
    this.fromBlock = opts.fromBlock;
    this.toBlock = opts.toBlock;
  }
}

export async function setupViemNetwork<TPublicClient extends PublicClient<Transport, Chain>>(
  publicClient: TPublicClient,
  worldAddress: Hex
) {
  devObservables.publicClient$.next(publicClient);
  devObservables.worldAddress$.next(worldAddress);

  // Optional but recommended to avoid multiple instances of polling for blocks
  const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });
  // const latestBlockNumber$ = await createBlockNumberStream({ block$: latestBlock$ });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
    // startWith(latestBlock$.value.number)
  );

  const maxBlockRange = 1000n;
  const previousBlockRange = { fromBlock: -1n, toBlock: -1n, blockRange: maxBlockRange };

  latestBlockNumber$
    .pipe(
      exhaustMap((blockNumber) =>
        of(blockNumber).pipe(
          switchMap(async (blockNumber) => {
            const fromBlock = previousBlockRange.toBlock + 1n;
            const toBlock = bigIntMin(fromBlock + previousBlockRange.blockRange, blockNumber);
            console.log("fetching block range", fromBlock, toBlock);

            previousBlockRange.fromBlock = fromBlock;
            previousBlockRange.toBlock = toBlock;
            previousBlockRange.blockRange = toBlock - fromBlock;

            // simulate block range error
            if (Math.random() < 0.2 && toBlock - fromBlock > 1n) {
              throw new Error("block range exceeded");
            }
            if (toBlock - fromBlock > 500n) {
              throw new Error("block range exceeded");
            }
            // simulate throttling
            if (Math.random() < 0.2) {
              throw new Error("too many requests");
            }

            const logs = await getLogs({
              publicClient,
              events: storeEventsAbi,
              address: worldAddress,
              fromBlock,
              toBlock,
            });
            return { fromBlock, toBlock, logs };
          }),
          retry({
            count: 10,
            delay: (error, retryCount) => {
              if (error.message === "too many requests") {
                const seconds = 2 * retryCount;
                console.warn(`too many requests, retrying in ${seconds}s`);
                return timer(1000 * seconds);
              }
              throw error;
            },
          }),
          catchError((error, caught) => {
            if (error.message === "block range exceeded") {
              const blockRange = previousBlockRange.toBlock - previousBlockRange.fromBlock;
              const newBlockRange = blockRange / 2n;
              if (newBlockRange <= 0n) {
                throw new Error("can't reduce block range any further");
              }
              console.warn("block range exceeded, trying a smaller block range");
              previousBlockRange.blockRange = newBlockRange;
              return caught;
            }
            throw error;
          })
        )
      ),
      tap(({ fromBlock, toBlock }) => {
        previousBlockRange.fromBlock = fromBlock;
        previousBlockRange.toBlock = toBlock;
        previousBlockRange.blockRange = maxBlockRange;
      })
    )
    .subscribe(({ fromBlock, toBlock, logs }) => {
      console.log("got logs", fromBlock, toBlock, logs);
    });

  // const blockEvents$ = await createBlockEventsStream({
  //   publicClient,
  //   address: worldAddress,
  //   events: storeEventsAbi,
  //   toBlock: latestBlockNumber$,
  // });

  // // TODO: create a cache per chain/world address
  // // TODO: check for world deploy block hash, invalidate cache if it changes
  // const db = createDatabase();
  // const storeCache = createDatabaseClient(db, mudConfig);

  // // TODO: store these in store cache, load into memory
  // const tableSchemas: Record<string, TableSchema> = {};
  // const tableValueNames: Record<string, readonly string[]> = {};

  // // TODO: figure out if we need to specifically handle piping/mapping to promises
  // blockEvents$
  //   .pipe(
  //     concatMap(
  //       blockEventsToStorage({
  //         async registerTableSchema({ namespace, name, schema }) {
  //           tableSchemas[`${namespace}:${name}`] = schema;
  //           console.log("registered schema", `${namespace}:${name}`, schema);
  //         },
  //         async registerTableMetadata({ namespace, name, keyNames, valueNames }) {
  //           tableValueNames[`${namespace}:${name}`] = valueNames;
  //           console.log("registered metadata", `${namespace}:${name}`, valueNames);
  //         },
  //         async getTableSchema({ namespace, name }) {
  //           return {
  //             namespace,
  //             name,
  //             schema: tableSchemas[`${namespace}:${name}`],
  //           };
  //         },
  //         async getTableMetadata({ namespace, name }) {
  //           return {
  //             namespace,
  //             name,
  //             keyNames: Object.getOwnPropertyNames(
  //               mudConfig.tables[name as keyof typeof mudConfig.tables]?.keySchema ?? {}
  //             ),
  //             valueNames: tableValueNames[`${namespace}:${name}`],
  //           };
  //         },
  //         async setRecord({ namespace, name, keyTuple, record }) {
  //           storeCache.set(namespace, name, keyTuple, record);
  //           console.log("stored record", `${namespace}:${name}`, keyTuple, record);
  //         },
  //         async setField({ namespace, name, keyTuple, valueName, value }) {
  //           storeCache.set(namespace, name, keyTuple, { [valueName]: value });
  //           console.log("stored field", `${namespace}:${name}`, keyTuple, valueName, value);
  //         },
  //         async deleteRecord({ namespace, name, keyTuple }) {
  //           storeCache.remove(namespace, name, keyTuple);
  //           console.log("deleted record", `${namespace}:${name}`, keyTuple);
  //         },
  //       })
  //     )
  //   )
  //   .subscribe();

  return {
    // publicClient,
    // storeCache,
    // latestBlock$,
    // latestBlockNumber$,
    // blockEvents$,
  };
}
