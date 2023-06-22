import { PublicClient, Transport, Chain, Hex } from "viem";
import { TableSchema } from "@latticexyz/protocol-parser";
import { createBlockEventsStream, createBlockNumberStream, createBlockStream } from "@latticexyz/block-events-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import mudConfig from "contracts/mud.config";
import * as devObservables from "@latticexyz/network/dev";
import { blockEventsToStorage } from "@latticexyz/store-sync";
import { concatMap } from "rxjs";

export async function setupViemNetwork<TPublicClient extends PublicClient<Transport, Chain>>(
  publicClient: TPublicClient,
  worldAddress: Hex
) {
  devObservables.publicClient$.next(publicClient);
  devObservables.worldAddress$.next(worldAddress);

  // Optional but recommended to avoid multiple instances of polling for blocks
  const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });
  const latestBlockNumber$ = await createBlockNumberStream({ block$: latestBlock$ });

  const blockEvents$ = await createBlockEventsStream({
    publicClient,
    address: worldAddress,
    events: storeEventsAbi,
    toBlock: latestBlockNumber$,
  });

  // TODO: create a cache per chain/world address
  // TODO: check for world deploy block hash, invalidate cache if it changes
  const db = createDatabase();
  const storeCache = createDatabaseClient(db, mudConfig);

  // TODO: store these in store cache, load into memory
  const tableSchemas: Record<string, TableSchema> = {};
  const tableValueNames: Record<string, readonly string[]> = {};

  // TODO: figure out if we need to specifically handle piping/mapping to promises
  blockEvents$
    .pipe(
      concatMap(
        blockEventsToStorage({
          async registerTableSchema({ namespace, name, schema }) {
            tableSchemas[`${namespace}:${name}`] = schema;
            console.log("registered schema", `${namespace}:${name}`, schema);
          },
          async registerTableMetadata({ namespace, name, keyNames, valueNames }) {
            tableValueNames[`${namespace}:${name}`] = valueNames;
            console.log("registered metadata", `${namespace}:${name}`, valueNames);
          },
          async getTableSchema({ namespace, name }) {
            return {
              namespace,
              name,
              schema: tableSchemas[`${namespace}:${name}`],
            };
          },
          async getTableMetadata({ namespace, name }) {
            return {
              namespace,
              name,
              keyNames: Object.getOwnPropertyNames(
                mudConfig.tables[name as keyof typeof mudConfig.tables]?.keySchema ?? {}
              ),
              valueNames: tableValueNames[`${namespace}:${name}`],
            };
          },
          async setRecord({ namespace, name, keyTuple, record }) {
            storeCache.set(namespace, name, keyTuple, record);
            console.log("stored record", `${namespace}:${name}`, keyTuple, record);
          },
          async setField({ namespace, name, keyTuple, valueName, value }) {
            storeCache.set(namespace, name, keyTuple, { [valueName]: value });
            console.log("stored field", `${namespace}:${name}`, keyTuple, valueName, value);
          },
          async deleteRecord({ namespace, name, keyTuple }) {
            storeCache.remove(namespace, name, keyTuple);
            console.log("deleted record", `${namespace}:${name}`, keyTuple);
          },
        })
      )
    )
    .subscribe();

  return {
    publicClient,
    storeCache,
    latestBlock$,
    latestBlockNumber$,
    blockEvents$,
  };
}
