import { BoundTable, Keys, TableRecord } from "./createStore";
import { recordMatches } from "./recordEquals";

export type QueryFragment = {
  table: BoundTable;
  filter: (encodedKey: string) => boolean;
  /**
   * The keys that should be included in the query result if this is the first fragment in the query.
   * This is to avoid having to iterate over each key in the first table if there is a more efficient
   * way to get to the initial result.
   */
  getInitialKeys: () => Keys;
};

/**
 * Matches all records that exist in the table.
 * RECS equivalent: Has(Component)
 */
export function In(table: BoundTable): QueryFragment {
  const filter = (encodedKey: string) => encodedKey in table.getRecords();
  const getInitialKeys = () => table.getKeys();
  return { table, filter, getInitialKeys };
}

/**
 * Matches all records that don't exist in the table.
 * RECS equivalent: Not(Component)
 */
export function NotIn(table: BoundTable): QueryFragment {
  const filter = (encodedKey: string) => !(encodedKey in table.getRecords());
  const getInitialKeys = () => ({});
  return { table, filter, getInitialKeys };
}

/**
 * Matches all records that match the provided partial record.
 * This works for both value and key, since both are part of the record.
 * RECS equivalent (only for value match): HasValue(Component, value)
 */
export function MatchRecord(table: BoundTable, partialRecord: TableRecord): QueryFragment {
  const filter = (encodedKey: string) => {
    const record = table.getRecords()[encodedKey];
    return recordMatches(partialRecord, record);
  };
  // TODO: this is a very naive and inefficient implementation for large tables, can be optimized via indexer tables
  const getInitialKeys = () => Object.fromEntries(Object.entries(table.getKeys()).filter(([key]) => filter(key)));
  return { table, filter, getInitialKeys };
}

/**
 * Matches all records that don't match the provided partial record.
 * This works for both value and key, since both are part of the record.
 * RECS equivalent (only for value match): NotValue(Component, value)
 * @param table
 * @param partialRecord
 */
export function NotMatchRecord(table: BoundTable, partialRecord: TableRecord): QueryFragment {
  const filter = (encodedKey: string) => {
    const record = table.getRecords()[encodedKey];
    return !recordMatches(partialRecord, record);
  };
  // TODO: this is a very naive and inefficient implementation for large tables, can be optimized via indexer tables
  const getInitialKeys = () => Object.fromEntries(Object.entries(table.getKeys()).filter(([key]) => filter(key)));
  return { table, filter, getInitialKeys };
}
