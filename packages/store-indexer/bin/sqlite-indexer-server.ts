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
import {
  chainState,
  createTable,
  getDatabase,
  getInternalDatabase,
  getTable,
  getTables,
  mudStoreTables,
} from "../src/sqlite/sqlite";
import { createSqliteTable } from "../src/sqlite/createSqliteTable";
import { and, eq, or } from "drizzle-orm";
import {
  DynamicAbiType,
  SchemaAbiType,
  SchemaAbiTypeToPrimitiveType,
  StaticAbiType,
  schemaAbiTypeToDefaultValue,
} from "@latticexyz/schema-type";
import { chunk } from "@latticexyz/common/utils";

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

function schemaToDefaults(
  schema: Record<string, SchemaAbiType>
): Record<string, SchemaAbiTypeToPrimitiveType<SchemaAbiType>> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, abiType]) => [key, schemaAbiTypeToDefaultValue[abiType]])
  );
}

blockLogs$
  .pipe(
    concatMap(
      blockEventsToStorage({
        async registerTables(chainTables) {
          const addresses = Array.from(new Set(chainTables.map((table) => table.address)));

          await Promise.all(
            addresses.map(async (address) => {
              const db = await getDatabase(chain.id, address);
              const tables = chainTables.filter((table) => table.address === address);

              await db.transaction(async (tx) => {
                for (const table of tables) {
                  const existingTable = await getTable(tx, table.namespace, table.name);
                  if (existingTable) {
                    console.log(
                      `table ${table.namespace}:${table.name} for world ${chain.id}:${address} already exists in DB, skipping`
                    );
                    continue;
                  }

                  console.log(`creating table ${table.namespace}:${table.name} for world ${chain.id}:${address}`);
                  await createTable(tx, {
                    namespace: table.namespace,
                    name: table.name,
                    // TODO: align these names?
                    keyTupleSchema: table.keyTuple,
                    valueSchema: table.value,
                    // TODO: pass log and/or block number into registerTable
                    lastUpdatedBlockNumber: startBlock,
                  });
                }
              });
            })
          );
        },
        async getTables(chainTables) {
          const addresses = Array.from(new Set(chainTables.map((table) => table.address)));

          return (
            await Promise.all(
              addresses.map(async (address) => {
                const db = await getDatabase(chain.id, address);

                // Too many tables causes errors
                //   Error: Expression tree is too large (maximum depth 1000)
                // so split them into 100-table chunks
                const chunks = [
                  ...chunk(
                    chainTables.filter((table) => table.address === address),
                    100
                  ),
                ];
                const tables = (await Promise.all(chunks.map((tables) => getTables(db, tables)))).flat();

                return tables.map((table) => ({
                  address,
                  namespace: table.namespace,
                  name: table.name,
                  // TODO: align these names?
                  keyTuple: table.keyTupleSchema,
                  value: table.valueSchema,
                }));
              })
            )
          ).flat();
        },
      })
    ),
    concatMap(async ({ blockNumber, operations: chainOperations }) => {
      // This is currently parallelized per world (each world has its own database).
      // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
      // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

      const addresses = Array.from(new Set(chainOperations.map((operation) => operation.log.address)));

      await Promise.all(
        addresses.map(async (address) => {
          const db = await getDatabase(chain.id, address);
          const operations = chainOperations.filter((operation) => operation.log.address === address);

          const tables = await Promise.all(
            Array.from(new Set(operations.map((operation) => JSON.stringify([operation.namespace, operation.name]))))
              .map((json) => JSON.parse(json))
              .map(async ([namespace, name]) => ({
                namespace,
                name,
                table: await getTable(db, namespace, name),
              }))
          );

          await db.transaction(async (tx) => {
            for (const { namespace, name } of tables) {
              await tx
                .update(mudStoreTables)
                .set({ lastUpdatedBlockNumber: blockNumber })
                .where(and(eq(mudStoreTables.namespace, namespace), eq(mudStoreTables.name, name)))
                .run();
            }

            for (const operation of operations) {
              if (operation.log.address !== address) continue;

              const table = tables.find(
                (table) => table.namespace === operation.namespace && table.name === operation.name
              )?.table;
              if (!table) {
                console.log(`table ${operation.namespace}:${operation.name} not found, skipping operation`, operation);
                continue;
              }

              const isSingleton = Object.keys(table.keyTupleSchema).length === 0;

              const { table: sqliteTable } = createSqliteTable(table);

              if (operation.type === "SetRecord") {
                await tx
                  .insert(sqliteTable)
                  .values({
                    ...operation.keyTuple,
                    ...operation.record,
                    __lastUpdatedBlockNumber: blockNumber,
                    __isDeleted: false,
                    ...(isSingleton ? { __singleton: true } : {}),
                  })
                  .onConflictDoUpdate({
                    target: isSingleton
                      ? sqliteTable.__singleton
                      : Object.keys(operation.keyTuple).map((columnName) => sqliteTable[columnName]),
                    set: {
                      ...operation.record,
                      __lastUpdatedBlockNumber: blockNumber,
                      __isDeleted: false,
                    },
                  })
                  .run();
                // console.log("stored record", operation);
              } else if (operation.type === "SetField") {
                await tx
                  .insert(sqliteTable)
                  .values({
                    ...operation.keyTuple,
                    ...schemaToDefaults(table.valueSchema),
                    [operation.valueName]: operation.value,
                    __lastUpdatedBlockNumber: blockNumber,
                    __isDeleted: false,
                    ...(isSingleton ? { __singleton: true } : {}),
                  })
                  .onConflictDoUpdate({
                    target: isSingleton
                      ? sqliteTable.__singleton
                      : Object.keys(operation.keyTuple).map((columnName) => sqliteTable[columnName]),
                    set: {
                      [operation.valueName]: operation.value,
                      __lastUpdatedBlockNumber: blockNumber,
                      __isDeleted: false,
                    },
                  })
                  .run();
                // console.log("stored field", operation);
              } else if (operation.type === "DeleteRecord") {
                await tx
                  .update(sqliteTable)
                  .set({
                    __lastUpdatedBlockNumber: blockNumber,
                    __isDeleted: true,
                  })
                  .where(
                    isSingleton
                      ? undefined
                      : and(
                          ...Object.entries(operation.keyTuple).map(([columnName, value]) =>
                            eq(sqliteTable[columnName], value)
                          )
                        )
                  )
                  .run();
                // console.log("deleted record", operation);
              }
            }
          });
        })
      );

      const internalDb = await getInternalDatabase();
      await internalDb
        .insert(chainState)
        .values({
          chainId: chain.id,
          lastUpdatedBlockNumber: blockNumber,
        })
        .onConflictDoUpdate({
          target: chainState.chainId,
          set: {
            lastUpdatedBlockNumber: blockNumber,
          },
        })
        .run();
    })
  )
  .subscribe();
