import { Hex, concatHex, getAddress } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import { buildTable } from "./buildTable";
import { debug } from "./debug";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { KeySchema, decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser/internal";
import { tables as internalTables } from "../postgres/tables";
import { createStorageAdapter as createBytesStorageAdapter } from "../postgres/createStorageAdapter";
import { setupTables } from "../postgres/setupTables";
import { getTables } from "./getTables";
import { hexToResource, resourceToLabel } from "@latticexyz/common";
import { GetRpcClientOptions } from "@latticexyz/block-logs-stream";
import { removeNullCharacters } from "./removeNullCharacters";

// Currently assumes one DB per chain ID

export type PostgresStorageAdapter = {
  storageAdapter: StorageAdapter;
  tables: typeof internalTables;
  cleanUp: () => Promise<void>;
};

export async function createStorageAdapter({
  database,
  ...opts
}: GetRpcClientOptions & {
  database: PgDatabase<QueryResultHKT>;
}): Promise<PostgresStorageAdapter> {
  const bytesStorageAdapter = await createBytesStorageAdapter({ ...opts, database });
  const cleanUp: (() => Promise<void>)[] = [];

  async function postgresStorageAdapter({ blockNumber, logs }: StorageAdapterBlock): Promise<void> {
    await bytesStorageAdapter.storageAdapter({ blockNumber, logs });

    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);
    const newSqlTables = newTables.map(buildTable);
    cleanUp.push(await setupTables(database, newSqlTables));

    // TODO: cache these inside `getTables`?
    const tables = await getTables(
      database,
      logs.map((log) => ({ address: log.address, tableId: log.args.tableId })),
    );

    // TODO: check if DB schema/table was created?

    // This is currently parallelized per world (each world has its own database).
    // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
    // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

    await database.transaction(async (tx) => {
      for (const log of logs) {
        const table = tables.find(
          (table) => getAddress(table.address) === getAddress(log.address) && table.tableId === log.args.tableId,
        );
        if (!table) {
          const { namespace, name } = hexToResource(log.args.tableId);
          debug(`table registration record for ${resourceToLabel({ namespace, name })} not found, skipping log`, log);
          continue;
        }

        const sqlTable = buildTable(table);
        const keyBytes = concatHex(log.args.keyTuple as Hex[]);
        const keyTupleLength = log.args.keyTuple.length;
        const keySchemaLength = Object.keys(table.keySchema).length;
        if (keySchemaLength !== keyTupleLength) {
          debug(
            `key tuple length ${keyTupleLength} does not match key schema length ${keySchemaLength}, skipping log`,
            { table, log },
          );
          continue;
        }
        const key = decodeKey(table.keySchema as KeySchema, log.args.keyTuple);

        if (
          log.eventName === "Store_SetRecord" ||
          log.eventName === "Store_SpliceStaticData" ||
          log.eventName === "Store_SpliceDynamicData"
        ) {
          const record = await database
            .select()
            .from(internalTables.recordsTable)
            .where(
              and(
                eq(internalTables.recordsTable.address, log.address),
                eq(internalTables.recordsTable.tableId, log.args.tableId),
                eq(internalTables.recordsTable.keyBytes, keyBytes),
              ),
            )
            .limit(1)
            // Get the first record in a way that returns a possible `undefined`
            // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
            .then((rows) => rows.find(() => true));
          if (!record) {
            const { namespace, name } = hexToResource(log.args.tableId);
            debug(
              `no record found for ${log.args.keyTuple} in table ${resourceToLabel({ namespace, name })}, skipping log`,
              log,
            );
            continue;
          }

          const value = decodeValueArgs(table.valueSchema, {
            staticData: record.staticData ?? "0x",
            encodedLengths: record.encodedLengths ?? "0x",
            dynamicData: record.dynamicData ?? "0x",
          });

          debug("upserting record", {
            namespace: table.namespace,
            name: table.name,
            key,
          });

          await tx
            .insert(sqlTable)
            .values({
              __keyBytes: keyBytes,
              __lastUpdatedBlockNumber: blockNumber,
              ...key,
              ...removeNullCharacters(table.valueSchema, value),
            })
            .onConflictDoUpdate({
              target: sqlTable.__keyBytes,
              set: {
                __lastUpdatedBlockNumber: blockNumber,
                ...removeNullCharacters(table.valueSchema, value),
              },
            })
            .execute();
        } else if (log.eventName === "Store_DeleteRecord") {
          debug("deleting record", {
            namespace: table.namespace,
            name: table.name,
            key,
          });

          await tx.delete(sqlTable).where(eq(sqlTable.__keyBytes, keyBytes)).execute();
        }
      }
    });
  }

  return {
    storageAdapter: postgresStorageAdapter,
    tables: internalTables,
    cleanUp: async (): Promise<void> => {
      for (const fn of cleanUp) {
        await fn();
      }
      await bytesStorageAdapter.cleanUp();
    },
  };
}
