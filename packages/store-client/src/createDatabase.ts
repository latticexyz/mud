import { InMemoryTupleStorage, TupleDatabase } from "tuple-database";

export function createDatabase() {
  return new TupleDatabase(new InMemoryTupleStorage());
}
