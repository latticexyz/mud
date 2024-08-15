import { TableRecord } from "./common";

/**
 * Compare two {@link TableRecord}s.
 * `a` can be a partial record, in which case only the keys present in `a` are compared to the corresponding keys in `b`.
 *
 * @param a Partial {@link TableRecord} to compare to `b`
 * @param b ${@link TableRecord} to compare `a` to.
 * @returns True if `a` equals `b` in the keys present in a or neither `a` nor `b` are defined, else false.
 *
 * @example
 * ```
 * recordMatches({ x: 1, y: 2 }, { x: 1, y: 3 }) // returns false because value of y doesn't match
 * recordMatches({ x: 1 }, { x: 1, y: 3 }) // returns true because x is equal and y is not present in a
 * ```
 */
export function recordMatches(a?: Partial<TableRecord>, b?: TableRecord) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
