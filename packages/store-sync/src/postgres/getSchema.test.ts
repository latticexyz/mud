import { describe, it, expect } from "vitest";
import { getSchema } from "./getSchema";
import { pgTable, pgSchema } from "drizzle-orm/pg-core";

// Test to make sure getSchema matches drizzle internals. May need to update getSchema if these tests start failing. Hopefully by then, drizzle will have exposed their own getSchema method.

describe("getSchema", () => {
  it("should return schema if set", async () => {
    expect(getSchema(pgTable("no schema", {}))).toBeUndefined();
    expect(getSchema(pgSchema("some schema").table("with schema", {}))).toBe("some schema");
  });
});
