/**
 * Ideas
 * - Update streams:
 *  - if each query added a new subscriber to the main state, each state update would trigger _every_ subscriber
 *  - instead we could add a subscriber per table, which can be subscribed to again, so we only have to iterate through all tables once,
 *    and then through all subscribers per table (only those who care about updates to this table)
 * - Query fragments:
 *  - Instead of pre-defined query types (Has, HasValue, Not, NotValue), could we define fragments in a self-contained way, so
 *    it's easy to add a new type of query fragment without changing the core code?
 *  - The main complexity is the logic to initialize the initial set with the first query fragment,
 *    but it's probably not that critical - we could just run the first fragment on all entities of the first table,
 *    unless an initialSet is provided.
 */

/**
 * TODOs
 * - Maybe turn `entityKey` into a tagged string? So we could make it the return type of `encodeKey`,
 *  and allow us to use Symbol (to reduce memory overhead) or something else later without breaking change
 */

import { BoundTable, TableRecord } from "./createStore";
import { recordMatches } from "./recordEquals";

export type QueryFragment = {
  table: BoundTable;
  filter: (encodedKey: string) => boolean;
};

/**
 * Matches all records that exist in the table.
 * RECS equivalent: Has(Component)
 */
export function In(table: BoundTable): QueryFragment {
  const filter = (encodedKey: string) => encodedKey in table.getRecords();
  return { table, filter };
}

/**
 * Matches all records that don't exist in the table.
 * RECS equivalent: Not(Component)
 */
export function NotIn(table: BoundTable): QueryFragment {
  const filter = (encodedKey: string) => !(encodedKey in table.getRecords());
  return { table, filter };
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
  return { table, filter };
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
  return { table, filter };
}
