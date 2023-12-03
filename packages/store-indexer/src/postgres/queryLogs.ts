import { Hex } from "viem";
import { SyncFilter } from "@latticexyz/store-sync";
import { isNotNull } from "@latticexyz/common/utils";
import { PendingQuery, Row, Sql } from "postgres";
import { hexToBytes } from "viem";

function and(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} AND ${condition}`)})`;
}

function or(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} OR ${condition}`)})`;
}

type Record = {
  indexerVersion: string;
  chainId: string;
  chainBlockNumber: string;
  address: Hex;
  tableId: Hex;
  keyBytes: Hex;
  staticData: Hex | null;
  encodedLengths: Hex | null;
  dynamicData: Hex | null;
  lastUpdatedBlockNumber: string;
};

export function queryLogs(
  sql: Sql,
  {
    address,
    filters = [],
  }: {
    readonly address?: Hex;
    readonly filters?: readonly SyncFilter[];
  }
): PendingQuery<Record[]> {
  const conditions = filters.length
    ? filters.map((filter) =>
        and(
          sql,
          [
            address != null ? sql`address = ${hexToBytes(address)}` : null,
            sql`table_id = ${hexToBytes(filter.tableId)}`,
            filter.key0 != null ? sql`key0 = ${hexToBytes(filter.key0)}` : null,
            filter.key1 != null ? sql`key1 = ${hexToBytes(filter.key1)}` : null,
          ].filter(isNotNull)
        )
      )
    : address != null
    ? [sql`address = ${hexToBytes(address)}`]
    : [];

  const where = sql`WHERE ${and(
    sql,
    [sql`is_deleted != true`, conditions.length ? or(sql, conditions) : null].filter(isNotNull)
  )}`;

  // TODO: implement bytea <> hex columns via custom types: https://github.com/porsager/postgres#custom-types
  // TODO: sort by logIndex (https://github.com/latticexyz/mud/issues/1979)
  return sql<Record[]>`
    WITH
      config AS (
        SELECT
          version AS "indexerVersion",
          chain_id AS "chainId",
          last_updated_block_number AS "chainBlockNumber"
        FROM mud.config
        LIMIT 1
      ),
      records AS (
        SELECT
          '0x' || encode(address, 'hex') AS address,
          '0x' || encode(table_id, 'hex') AS "tableId",
          '0x' || encode(key_bytes, 'hex') AS "keyBytes",
          '0x' || encode(static_data, 'hex') AS "staticData",
          '0x' || encode(encoded_lengths, 'hex') AS "encodedLengths",
          '0x' || encode(dynamic_data, 'hex') AS "dynamicData",
          last_updated_block_number AS "recordBlockNumber"
        FROM mud.records
        ${where}
        ORDER BY last_updated_block_number ASC
      )

    SELECT
      (SELECT COUNT(*) FROM records) AS "totalRows",
      *
    FROM config, records
  `;
}
