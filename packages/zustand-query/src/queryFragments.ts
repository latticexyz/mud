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
