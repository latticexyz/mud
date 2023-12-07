import { isNotNull } from "@latticexyz/common/utils";
import { PendingQuery, Row, Sql } from "postgres";
import { hexToBytes } from "viem";
import { z } from "zod";
import { input } from "@latticexyz/store-sync/indexer-client";
import { transformSchemaName } from "@latticexyz/store-sync/postgres";
import { Record } from "./common";

const schemaName = transformSchemaName("mud");

function and(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} AND ${condition}`)})`;
}

function or(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} OR ${condition}`)})`;
}

export function queryLogs(sql: Sql, opts: z.infer<typeof input>): PendingQuery<Record[]> {
  const conditions = opts.filters.length
    ? opts.filters.map((filter) =>
        and(
          sql,
          [
            opts.address != null ? sql`address = ${hexToBytes(opts.address)}` : null,
            sql`table_id = ${hexToBytes(filter.tableId)}`,
            filter.key0 != null ? sql`key0 = ${hexToBytes(filter.key0)}` : null,
            filter.key1 != null ? sql`key1 = ${hexToBytes(filter.key1)}` : null,
          ].filter(isNotNull)
        )
      )
    : opts.address != null
    ? [sql`address = ${hexToBytes(opts.address)}`]
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
          block_number AS "chainBlockNumber"
        FROM ${sql(`${schemaName}.config`)}
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
          block_number AS "recordBlockNumber",
          log_index AS "logIndex"
        FROM ${sql(`${schemaName}.records`)}
        ${where}
        ORDER BY block_number, log_index ASC
      )
    SELECT
      (SELECT COUNT(*) FROM records) AS "totalRows",
      *
    FROM config, records
  `;
}
