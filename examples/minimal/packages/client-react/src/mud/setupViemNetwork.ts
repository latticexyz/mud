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
  EMPTY,
  Observable,
  catchError,
  concatMap,
  defer,
  delay,
  delayWhen,
  exhaustMap,
  expand,
  filter,
  first,
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

const maxBlockRange = 1000n;

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

  async function getLogsWithSimulatedErrors(
    opts: Parameters<typeof getLogs>[0] & { fromBlock: bigint; toBlock: bigint }
  ): ReturnType<typeof getLogs> {
    if (Math.random() < 0.2 && opts.toBlock - opts.fromBlock > 1n) {
      throw new Error("block range exceeded");
    }
    if (opts.toBlock - opts.fromBlock > 500n) {
      throw new Error("block range exceeded");
    }
    // simulate throttling
    if (Math.random() < 0.2) {
      throw new Error("too many requests");
    }
    return await getLogs(opts);
  }

  async function fetchLogs(
    opts: Parameters<typeof getLogs>[0] & { fromBlock: bigint; toBlock: bigint },
    retryCount = 0
  ): Promise<{
    fromBlock: bigint;
    toBlock: bigint;
    logs: Awaited<ReturnType<typeof getLogs>>;
  }> {
    try {
      const fromBlock = opts.fromBlock;
      // TODO: make maxBlockRange an arg so we can adjust if we detect too many of the same block range exceeded errors
      const blockRange = bigIntMin(maxBlockRange, opts.toBlock - fromBlock);
      const toBlock = fromBlock + blockRange;

      const logs = await getLogsWithSimulatedErrors({ ...opts, fromBlock, toBlock });
      return { fromBlock, toBlock, logs };
    } catch (error: unknown) {
      if (!(error instanceof Error)) throw error;

      if (error.message === "too many requests" && retryCount < 10) {
        const seconds = 2 * retryCount;
        console.warn(`too many requests, retrying in ${seconds}s`);
        // TODO: move this to a util
        await new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
        return await fetchLogs(opts, retryCount + 1);
      }

      if (error.message === "block range exceeded") {
        const blockRange = opts.toBlock - opts.fromBlock;
        const newBlockRange = blockRange / 2n;
        if (newBlockRange <= 0n) {
          throw new Error("can't reduce block range any further");
        }
        console.warn("block range exceeded, trying a smaller block range");
        return await fetchLogs(
          {
            ...opts,
            toBlock: opts.fromBlock + newBlockRange,
          },
          retryCount
        );
      }

      throw error;
    }
  }

  let fromBlock = 0n;

  latestBlockNumber$
    .pipe(
      exhaustMap((latestBlockNumber) => {
        return from(
          fetchLogs({
            publicClient,
            address: worldAddress,
            events: storeEventsAbi,
            fromBlock,
            toBlock: latestBlockNumber,
          })
        ).pipe(
          tap((result) => {
            fromBlock = result.toBlock + 1n;
          })
        );
      })
    )
    .subscribe(({ fromBlock, toBlock, logs }) => {
      console.log("got logs", fromBlock, toBlock, logs);
    });

  //
  //
  //
  //
  //

  // const blockEvents$ = await createBlockEventsStream({
  //   publicClient,
  //   address: worldAddress,
  //   events: storeEventsAbi,
  //   toBlock: latestBlockNumber$,
  // });

  // TODO: create a cache per chain/world address
  // TODO: check for world deploy block hash, invalidate cache if it changes
  const db = createDatabase();
  const storeCache = createDatabaseClient(db, mudConfig);

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
    publicClient,
    storeCache,
    // latestBlock$,
    // latestBlockNumber$,
    // blockEvents$,
  };
}
