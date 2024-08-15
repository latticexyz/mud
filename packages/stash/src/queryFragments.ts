import { Table } from "@latticexyz/config";
import { Keys, Stash } from "./common";
import { TableRecord } from "./common";
import { recordMatches } from "./recordEquals";
import { getRecords } from "./actions/getRecords";
import { getKeys } from "./actions/getKeys";

// TODO: add more query fragments - ie GreaterThan, LessThan, Range, etc

export type QueryFragment<table extends Table = Table> = {
  table: table;
  /**
   * Checking an individual table row for whether it matches the query fragment
   */
  match: (stash: Stash, encodedKey: string) => boolean;
  /**
   * The keys that should be included in the query result if this is the first fragment in the query.
   * This is to avoid having to iterate over each key in the first table if there is a more efficient
   * way to get to the initial result.
   */
  getInitialKeys: (stash: Stash) => Keys;
};

/**
 * Matches all records that exist in the table.
 * RECS equivalent: Has(Component)
 */
export function In<table extends Table>(table: table): QueryFragment<table> {
  const match = (stash: Stash, encodedKey: string) => encodedKey in getRecords({ stash, table });
  const getInitialKeys = (stash: Stash) => getKeys({ stash, table });
  return { table, match, getInitialKeys };
}

/**
 * Matches all records that don't exist in the table.
 * RECS equivalent: Not(Component)
 */
export function NotIn<table extends Table>(table: table): QueryFragment<table> {
  const match = (stash: Stash, encodedKey: string) => !(encodedKey in getRecords({ stash, table }));
  const getInitialKeys = () => ({});
  return { table, match, getInitialKeys };
}

/**
 * Matches all records that match the provided partial record.
 * This works for both value and key, since both are part of the record.
 * RECS equivalent (only for value match): HasValue(Component, value)
 */
export function MatchRecord<table extends Table>(
  table: table,
  partialRecord: Partial<TableRecord<table>>,
): QueryFragment<table> {
  const match = (stash: Stash, encodedKey: string) => {
    const record = getRecords({ stash, table })[encodedKey];
    return recordMatches(partialRecord, record);
  };
  // TODO: this is a very naive and inefficient implementation for large tables, can be optimized via indexer tables
  const getInitialKeys = (stash: Stash) =>
    Object.fromEntries(Object.entries(getKeys({ stash, table })).filter(([key]) => match(stash, key)));
  return { table, match, getInitialKeys };
}

/**
 * Matches all records that don't match the provided partial record.
 * This works for both value and key, since both are part of the record.
 * RECS equivalent (only for value match): NotValue(Component, value)
 * @param table
 * @param partialRecord
 */
export function NotMatchRecord<table extends Table>(
  table: table,
  partialRecord: Partial<TableRecord<table>>,
): QueryFragment<table> {
  const match = (stash: Stash, encodedKey: string) => {
    const record = getRecords({ stash, table })[encodedKey];
    return !recordMatches(partialRecord, record);
  };
  // TODO: this is a very naive and inefficient implementation for large tables, can be optimized via indexer tables
  const getInitialKeys = (stash: Stash) =>
    Object.fromEntries(Object.entries(getKeys({ stash, table })).filter(([key]) => match(stash, key)));
  return { table, match, getInitialKeys };
}
