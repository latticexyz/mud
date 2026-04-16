import { Table } from "@latticexyz/config";
import { Hex } from "viem";

export type TableQuery = {
  table: Table;
  /**
   * SQL to filter the records of this table.
   * The SQL result is expected to be of the same culumn shape as the table.
   * Use the `selectFrom` helper to ensure the expected column shape.
   * Note: requires an indexer with SQL API
   */
  sql: string;
  /**
   * Optionally filter to only include records updated in this block or earlier.
   */
  toBlock?: bigint;
};

export type LogFilter = {
  /**
   * Filter logs by the table ID.
   */
  table: Table;
  /**
   * Optionally filter by the `bytes32` value of the key in the first position (index zero of the record's key tuple).
   */
  key0?: Hex;
  /**
   * Optionally filter by the `bytes32` value of the key in the second position (index one of the record's key tuple).
   */
  key1?: Hex;
};

export type SyncFilter = TableQuery | LogFilter;
