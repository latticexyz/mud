import { beforeEach, describe, expect, it } from "vitest";
import { createDatabase, createDatabaseClient } from "../src";
import { mudConfig } from "@latticexyz/store/register";

const config = mudConfig({
  tables: {
    Counter: { primaryKeys: { first: "bytes32", second: "uint256" }, schema: "uint256" },
    Position: { schema: { x: "int32", y: "int32" } },
  },
} as const);

describe("createDatabaseClient", () => {
  let db: ReturnType<typeof createDatabase>;
  let client: ReturnType<typeof createDatabaseClient<typeof config>>;

  beforeEach(() => {
    db = createDatabase();
    client = createDatabaseClient(db, config);
  });

  it("should set and get typed values", () => {
    const key = { first: "0x00", second: BigInt(1) } as const;
    const value = { value: BigInt(2) };

    // Set a value
    client.Counter.set(key, value);

    // Expect the value to be set
    expect(client.Counter.get(key)).toEqual(value);
  });

  it("should initialize with Solidity default values", () => {
    const key = { key: "0x00" } as const;

    // Set a partial value
    client.Position.set(key, {});

    // Expect the value to be initialized with default values
    expect(client.Position.get(key)).toEqual({ x: 0, y: 0 });

    // TODO: add tests for other abi types
  });

  it("should partially update existing values", () => {
    const key = { key: "0x00" } as const;

    // Set a partial value
    client.Position.set(key, { x: 1 });

    // Expect the value to be set and extended with default values
    expect(client.Position.get(key)).toEqual({ x: 1, y: 0 });

    // Set another partial value
    client.Position.set(key, { y: 2 });

    // Expect the value to be partially updated
    expect(client.Position.get(key)).toEqual({ x: 1, y: 2 });
  });

  it("should remove values", () => {
    const db = createDatabase();
    const client = createDatabaseClient(db, config);

    const key = { first: "0x00", second: BigInt(1) } as const;
    const value = { value: BigInt(2) };

    // Set the value
    client.Counter.set(key, value);
    expect(client.Counter.get(key)).toEqual(value);

    // Remove the value
    client.Counter.remove(key);
    expect(client.Counter.get(key)).toBeUndefined();
  });
});
