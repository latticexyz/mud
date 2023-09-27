import { eq, inArray, and } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createSqliteTable, chainState, getTables } from "@latticexyz/store-sync/sqlite";
import { QueryAdapter } from "@latticexyz/store-sync/trpc-indexer";
import { debug } from "../debug";
import { Hex, getAddress } from "viem";

const EXCLUDE_TABLES = [
  "Position",
  "MoveDifficulty",
  "TerrainType",
  "ArmorModifier",
  "Untraversable",
  "LastAction",
  "StaminaOnKill",
  "UnitType",
  "Movable",
  "Capturer",
  "Range",
  "Tier",
  "Combat",
  "StructureType",
  "Capturable",
  "KillCount",
  "Stamina",
  "ChargeCap",
  "Charger",
  "Chargee",
  "ChargedByStart",
  "Factory",
];

/**
 * Creates a storage adapter for the tRPC server/client to query data from SQLite.
 *
 * @param {BaseSQLiteDatabase<"sync", any>} database SQLite database object from Drizzle
 * @returns {Promise<QueryAdapter>} A set of methods used by tRPC endpoints.
 */
export async function createQueryAdapter(database: BaseSQLiteDatabase<"sync", any>): Promise<QueryAdapter> {
  const adapter: QueryAdapter = {
    async findAll({ chainId, address, tableIds, matchId }) {
      const tables = getTables(database)
        .filter((table) => address == null || getAddress(address) === getAddress(table.address))
        .filter((table) => tableIds == null || tableIds.includes(table.tableId))
        .filter((table) =>
          // we don't need KeysWithValue tables
          matchId != null ? table.namespace !== "keyswval" : true
        );

      const entities = ((): Hex[] => {
        if (!address || !matchId) return [];
        try {
          const Position = createSqliteTable({
            address,
            namespace: "",
            name: "Position",
            keySchema: { key: "bytes32" },
            valueSchema: {
              x: "int32",
              y: "int32",
              z: "int32",
            },
          });

          const Match = createSqliteTable({
            address,
            namespace: "",
            name: "Match",
            keySchema: { key: "bytes32" },
            valueSchema: {
              value: "int32",
            },
          });

          const positions = database.select().from(Position).where(eq(Position.z, matchId)).all();
          const positionKeys = positions.map((pos) => pos.key);

          const matches = database.select().from(Match).where(eq(Match.value, matchId)).all();
          const matchKeys = matches.map((match) => match.key);

          return [...new Set([...positionKeys, ...matchKeys])];
        } catch (error: unknown) {
          return [];
        }
      })();

      const tablesWithRecords = tables.map((table) => {
        const sqliteTable = createSqliteTable(table);
        const records = database
          .select()
          .from(sqliteTable)
          .where(
            and(
              eq(sqliteTable.__isDeleted, false),
              entities.length && EXCLUDE_TABLES.includes(table.name) ? inArray(sqliteTable.__key, entities) : undefined
            )
          )
          .all();
        return {
          ...table,
          records: records.map((record) => ({
            key: Object.fromEntries(Object.entries(table.keySchema).map(([name]) => [name, record[name]])),
            value: Object.fromEntries(Object.entries(table.valueSchema).map(([name]) => [name, record[name]])),
          })),
        };
      });

      const metadata = database.select().from(chainState).where(eq(chainState.chainId, chainId)).all();
      const { lastUpdatedBlockNumber } = metadata[0] ?? {};

      const result = {
        blockNumber: lastUpdatedBlockNumber ?? null,
        tables: tablesWithRecords,
      };

      const count = tablesWithRecords.reduce((sum, table) => sum + table.records.length, 0);

      debug(
        "findAll",
        "chainId:",
        chainId,
        "address:",
        address,
        "tables:",
        tablesWithRecords.length,
        "records:",
        count
      );

      return result;
    },
  };
  return adapter;
}
