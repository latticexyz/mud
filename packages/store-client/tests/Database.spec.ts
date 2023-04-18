import { describe, expect, it } from "vitest";
import { createDatabase, createDatabaseClient, upsert } from "../src";
import { InMemoryTupleStorage, TupleDatabase } from "tuple-database";
import { StoreConfigShorthand } from "@latticexyz/config";

const config = {
  tables: {
    Counter: { primaryKeys: { first: "bytes32", second: "uint256" }, schema: "uint256" },
  },
} as const satisfies StoreConfigShorthand;

describe("createDatabase", () => {
  it("should create a tuple database", () => {
    const db = createDatabase();
    expect(db).toEqual(new TupleDatabase(new InMemoryTupleStorage()));
  });
});

describe("createDatabaseClient", () => {
  it("should set and get typed values", () => {
    const db = createDatabase();
    const client = createDatabaseClient(db, config);

    const key = { first: "key", second: BigInt(1) };
    const value = { value: BigInt(2) };

    client.Counter.upsert(key, value);
    expect(client.Counter.get(key)).toEqual(value);
  });

  it("should initialize with Solidity default values", () => {
    const db = createDatabase();
    const client = createDatabaseClient(db, config);

    const key = { first: "key", second: BigInt(1) };

    client.Counter.upsert(key, {});
    expect(client.Counter.get(key)).toEqual({ value: 0n });
  });

  it("should remove values", () => {
    const db = createDatabase();
    const client = createDatabaseClient(db, config);

    const key = { first: "key", second: BigInt(1) };
    const value = { value: BigInt(2) };

    // Set the value
    client.Counter.upsert(key, value);
    expect(client.Counter.get(key)).toEqual(value);

    // Remove the value
    client.Counter.remove(key);
    expect(client.Counter.get(key)).toBeUndefined();
  });
});

describe("Performance", () => {
  const size = 10_000;

  function timeIt(fn: () => unknown) {
    const start = Date.now();
    fn();
    const end = Date.now();
    const duration = end - start;
    console.log("Duration:", duration);
    return duration;
  }

  it(`set ${size} values`, () => {
    const db = createDatabase();
    const client = createDatabaseClient(db, config);
    const key = { first: "key", second: BigInt(0) };
    const value = { value: BigInt(0) };

    const time = timeIt(() => {
      for (let i = 0; i < size; i++) {
        client.Counter.upsert(key, value);
      }
    });

    expect(time).toBeLessThan(500);
  });
});
