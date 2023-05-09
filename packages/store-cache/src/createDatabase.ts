import { InMemoryTupleStorage, TupleDatabase } from "tuple-database";

/**
 * Create a new in-memory tuple database
 */
export function createDatabase() {
  return new TupleDatabase(new InMemoryTupleStorage());
}
