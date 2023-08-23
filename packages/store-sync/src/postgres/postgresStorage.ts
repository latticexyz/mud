import { PublicClient, concatHex, encodeAbiParameters } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import { createTable } from "./createTable";
import { schemaToDefaults } from "../schemaToDefaults";
import { BlockLogsToStorageOptions } from "../blockLogsToStorage";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { createInternalTables } from "./createInternalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { tableIdToHex } from "@latticexyz/common";
import { identity } from "@latticexyz/common/utils";
import { setupTables } from "./setupTables";
import { getTableKey } from "./getTableKey";

// Currently assumes one DB per chain ID

type PostgresStorage<TConfig extends StoreConfig> = BlockLogsToStorageOptions<TConfig> & {
  internalTables: ReturnType<typeof createInternalTables>;
  cleanUp: () => Promise<void>;
};

export async function postgresStorage<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
}: {
  database: PgDatabase<QueryResultHKT>;
  publicClient: PublicClient;
  config?: TConfig;
}): Promise<PostgresStorage<TConfig>> {
  const cleanUp: (() => Promise<void>)[] = [];

  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  const internalTables = createInternalTables();
  cleanUp.push(await setupTables(database, Object.values(internalTables)));

  const storage = {
    async registerTables({ blockNumber, tables }) {
      const sqlTables = tables.map((table) =>
        createTable({
          address: table.address,
          namespace: table.namespace,
          name: table.name,
          keySchema: table.keySchema,
          valueSchema: table.valueSchema,
        })
      );

      cleanUp.push(await setupTables(database, sqlTables));

      await database.transaction(async (tx) => {
        for (const table of tables) {
          await tx
            .insert(internalTables.tables)
            .values({
              schemaVersion,
              id: getTableKey(table),
              address: table.address,
              tableId: tableIdToHex(table.namespace, table.name),
              namespace: table.namespace,
              name: table.name,
              keySchema: table.keySchema,
              valueSchema: table.valueSchema,
              lastUpdatedBlockNumber: blockNumber,
            })
            .onConflictDoNothing()
            .execute();
        }
      });
    },
    async getTables({ tables }) {
      // TODO: fetch any missing schemas from RPC
      // TODO: cache schemas in memory?
      return getTables(database, tables.map(getTableKey));
    },
    async storeOperations({ blockNumber, operations }) {
      // This is currently parallelized per world (each world has its own database).
      // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
      // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

      const tables = await getTables(database, operations.map(getTableKey));

      await database.transaction(async (tx) => {
        for (const { address, namespace, name } of tables) {
          await tx
            .update(internalTables.tables)
            .set({ lastUpdatedBlockNumber: blockNumber })
            .where(
              and(
                eq(internalTables.tables.address, address),
                eq(internalTables.tables.namespace, namespace),
                eq(internalTables.tables.name, name)
              )
            )
            .execute();
        }

        for (const operation of operations) {
          const table = tables.find((table) => getTableKey(table) === getTableKey(operation));
          if (!table) {
            debug(`table ${operation.namespace}:${operation.name} not found, skipping operation`, operation);
            continue;
          }

          const sqlTable = createTable(table);
          const key = concatHex(
            Object.entries(table.keySchema).map(([keyName, type]) =>
              encodeAbiParameters([{ type }], [operation.key[keyName]])
            )
          );

          if (operation.type === "SetRecord") {
            debug("SetRecord", operation);
            await tx
              .insert(sqlTable)
              .values({
                __key: key,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...operation.key,
                ...operation.value,
              })
              .onConflictDoUpdate({
                target: sqlTable.__key,
                set: {
                  __lastUpdatedBlockNumber: blockNumber,
                  __isDeleted: false,
                  ...operation.value,
                },
              })
              .execute();
          } else if (operation.type === "SetField") {
            debug("SetField", operation);
            await tx
              .insert(sqlTable)
              .values({
                __key: key,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...operation.key,
                ...schemaToDefaults(table.valueSchema),
                [operation.fieldName]: operation.fieldValue,
              })
              .onConflictDoUpdate({
                target: sqlTable.__key,
                set: {
                  __lastUpdatedBlockNumber: blockNumber,
                  __isDeleted: false,
                  [operation.fieldName]: operation.fieldValue,
                },
              })
              .execute();
          } else if (operation.type === "DeleteRecord") {
            // TODO: should we upsert so we at least have a DB record of when a thing was created/deleted within the same block?
            debug("DeleteRecord", operation);
            await tx
              .update(sqlTable)
              .set({
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: true,
              })
              .where(eq(sqlTable.__key, key))
              .execute();
          }
        }

        await tx
          .insert(internalTables.chain)
          .values({
            schemaVersion,
            chainId,
            lastUpdatedBlockNumber: blockNumber,
          })
          .onConflictDoUpdate({
            target: [internalTables.chain.schemaVersion, internalTables.chain.chainId],
            set: {
              lastUpdatedBlockNumber: blockNumber,
            },
          })
          .execute();
      });
    },
  } as BlockLogsToStorageOptions<TConfig>;

  return {
    ...storage,
    internalTables,
    cleanUp: async (): Promise<void> => {
      for (const fn of cleanUp) {
        await fn();
      }
    },
  };
}
