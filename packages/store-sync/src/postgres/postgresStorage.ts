import { PublicClient, concatHex, encodeAbiParameters } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { eq, inArray } from "drizzle-orm";
import { buildTable } from "./buildTable";
import { schemaToDefaults } from "../schemaToDefaults";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { buildInternalTables } from "./buildInternalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { tableIdToHex } from "@latticexyz/common";
import { setupTables } from "./setupTables";
import { getTableKey } from "./getTableKey";
import { StorageAdapter } from "../common";

// Currently assumes one DB per chain ID

export type PostgresStorageAdapter<TConfig extends StoreConfig = StoreConfig> = StorageAdapter<TConfig> & {
  internalTables: ReturnType<typeof buildInternalTables>;
  cleanUp: () => Promise<void>;
};

export async function postgresStorage<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
}: {
  database: PgDatabase<QueryResultHKT>;
  publicClient: PublicClient;
  config?: TConfig;
}): Promise<PostgresStorageAdapter<TConfig>> {
  const cleanUp: (() => Promise<void>)[] = [];

  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  const internalTables = buildInternalTables();
  cleanUp.push(await setupTables(database, Object.values(internalTables)));

  const storageAdapter = {
    async registerTables({ blockNumber, tables }) {
      const sqlTables = tables.map((table) =>
        buildTable({
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
              key: getTableKey(table),
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
        const tablesWithOperations = tables.filter((table) =>
          operations.some((op) => getTableKey(op) === getTableKey(table))
        );
        if (tablesWithOperations.length) {
          await tx
            .update(internalTables.tables)
            .set({ lastUpdatedBlockNumber: blockNumber })
            .where(inArray(internalTables.tables.key, [...new Set(tablesWithOperations.map(getTableKey))]))
            .execute();
        }

        for (const operation of operations) {
          const table = tables.find((table) => getTableKey(table) === getTableKey(operation));
          if (!table) {
            debug(`table ${operation.namespace}:${operation.name} not found, skipping operation`, operation);
            continue;
          }

          const sqlTable = buildTable(table);
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
  } as StorageAdapter<TConfig>;

  return {
    ...storageAdapter,
    internalTables,
    cleanUp: async (): Promise<void> => {
      for (const fn of cleanUp) {
        await fn();
      }
    },
  };
}
