import { PublicClient, concatHex, encodeAbiParameters, getAddress } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { and, eq, sql } from "drizzle-orm";
import { createTable } from "./createTable";
import { schemaToDefaults } from "../schemaToDefaults";
import { BlockLogsToStorageOptions } from "../blockLogsToStorage";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { getTableName } from "./getTableName";
import { chainState, mudStoreTables } from "./internalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { tableToSql } from "../sql/tableToSql";
import { tableIdToHex } from "@latticexyz/common";

export async function postgresStorage<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
}: {
  database: PgDatabase<QueryResultHKT>;
  publicClient: PublicClient;
  config?: TConfig;
}): Promise<BlockLogsToStorageOptions<TConfig>> {
  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  // TODO: should these run lazily before first `registerTables`?
  await database.transaction(async (tx) => {
    await tx.execute(sql.raw(tableToSql("postgres", chainState)));
    await tx.execute(sql.raw(tableToSql("postgres", mudStoreTables)));
  });

  return {
    async registerTables({ blockNumber, tables }) {
      await database.transaction(async (tx) => {
        for (const table of tables) {
          debug(`creating table ${table.namespace}:${table.name} for world ${chainId}:${table.address}`);

          const sqlTable = createTable({
            address: table.address,
            namespace: table.namespace,
            name: table.name,
            keySchema: table.keySchema,
            valueSchema: table.valueSchema,
          });

          await tx.execute(sql.raw(tableToSql("postgres", sqlTable)));

          await tx
            .insert(mudStoreTables)
            .values({
              schemaVersion,
              id: getTableName(table.address, table.namespace, table.name),
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
      return getTables(database, tables);
    },
    async storeOperations({ blockNumber, operations }) {
      // This is currently parallelized per world (each world has its own database).
      // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
      // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

      const tables = await getTables(
        database,
        Array.from(
          new Set(
            operations.map((operation) =>
              JSON.stringify({
                address: getAddress(operation.address),
                namespace: operation.namespace,
                name: operation.name,
              })
            )
          )
        ).map((json) => JSON.parse(json))
      );

      await database.transaction(async (tx) => {
        for (const { address, namespace, name } of tables) {
          await tx
            .update(mudStoreTables)
            .set({ lastUpdatedBlockNumber: blockNumber })
            .where(
              and(
                eq(mudStoreTables.address, address),
                eq(mudStoreTables.namespace, namespace),
                eq(mudStoreTables.name, name)
              )
            );
        }

        for (const operation of operations) {
          const table = tables.find(
            (table) =>
              table.address === getAddress(operation.address) &&
              table.namespace === operation.namespace &&
              table.name === operation.name
          );
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
              });
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
              });
          } else if (operation.type === "DeleteRecord") {
            // TODO: should we upsert so we at least have a DB record of when a thing was created/deleted within the same block?
            debug("DeleteRecord", operation);
            await tx
              .update(sqlTable)
              .set({
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: true,
              })
              .where(eq(sqlTable.__key, key));
          }
        }

        await tx
          .insert(chainState)
          .values({
            schemaVersion,
            chainId,
            lastUpdatedBlockNumber: blockNumber,
          })
          .onConflictDoUpdate({
            target: [chainState.schemaVersion, chainState.chainId],
            set: {
              lastUpdatedBlockNumber: blockNumber,
            },
          });
      });
    },
  } as BlockLogsToStorageOptions<TConfig>;
}
