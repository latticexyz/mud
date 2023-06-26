import { describe, expect, it } from "vitest";
import { createDatabase } from ".";
import { InMemoryTupleStorage, AsyncTupleDatabase } from "tuple-database";

describe("createDatabase", () => {
  it("should create a tuple database", () => {
    const db = createDatabase();
    expect(db).toEqual(new AsyncTupleDatabase(new InMemoryTupleStorage()));
  });
});
