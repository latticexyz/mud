import { describe, expect, it } from "vitest";
import { createDatabase } from "../src";
import { InMemoryTupleStorage, TupleDatabase } from "tuple-database";

describe("createDatabase", () => {
  it("should create a tuple database", () => {
    const db = createDatabase();
    expect(db).toEqual(new TupleDatabase(new InMemoryTupleStorage()));
  });
});
