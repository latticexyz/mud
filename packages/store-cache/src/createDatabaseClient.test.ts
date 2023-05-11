import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { createDatabase, createDatabaseClient } from ".";
import { mudConfig } from "@latticexyz/store/register";
import { KeyValue } from "./types";

const config = mudConfig({
  tables: {
    Counter: { primaryKeys: { first: "bytes32", second: "uint256" }, schema: "uint256" },
    Position: { schema: { x: "int32", y: "int32" } },
    MultiKey: { primaryKeys: { first: "bytes32", second: "uint32" }, schema: "int32" },
    EnumTable: { primaryKeys: { first: "Enum1" }, schema: "Enum2" },
    MultiTable: { schema: { arr: "int32[]", str: "string", bts: "bytes" } },
  },
  enums: {
    Enum1: ["A1", "A2"],
    Enum2: ["B1", "B2"],
  },
});

describe("createDatabaseClient", () => {
  let db: ReturnType<typeof createDatabase>;
  let client: ReturnType<typeof createDatabaseClient<typeof config>>;
  let tables: (typeof client)["tables"];

  beforeEach(() => {
    db = createDatabase();
    client = createDatabaseClient(db, config);
    tables = client.tables;
  });

  describe("Types", () => {
    it("should infer enums as numbers", () => {
      expectTypeOf(tables.EnumTable.set).parameter(0).toMatchTypeOf<{ first: number }>();
      expectTypeOf(tables.EnumTable.set).parameter(1).toMatchTypeOf<{ value?: number }>();
    });

    it("should infer bytes32 as string and uint256 as bigint", () => {
      expectTypeOf(tables.Counter.set).parameter(0).toMatchTypeOf<{ first: string; second: bigint }>();
      expectTypeOf(tables.Counter.set).parameter(1).toMatchTypeOf<{ value?: bigint }>();
    });

    it("should infer int32[] as number[]", () => {
      expectTypeOf(tables.MultiTable.set).parameter(1).toMatchTypeOf<{ arr?: number[] }>();
    });

    it("should infer string as string", () => {
      expectTypeOf(tables.MultiTable.set).parameter(1).toMatchTypeOf<{ str?: string }>();
    });

    it("should infer bytes as string", () => {
      expectTypeOf(tables.MultiTable.set).parameter(1).toMatchTypeOf<{ bts?: string }>();
    });
  });

  it("should set and get typed values", () => {
    const key = { first: "0x00", second: BigInt(1) } as const;
    const value = { value: BigInt(2) };

    // Set a value
    tables.Counter.set(key, value);

    // Expect the value to be set
    expect(tables.Counter.get(key)).toEqual(value);
  });

  it("should initialize with Solidity default values", () => {
    const key = { key: "0x00" } as const;

    // Set a partial value
    tables.Position.set(key, {});

    // Expect the value to be initialized with default values
    expect(tables.Position.get(key)).toEqual({ x: 0, y: 0 });

    // TODO: add tests for other abi types
  });

  it("should partially update existing values", () => {
    const key = { key: "0x00" } as const;

    // Set a partial value
    tables.Position.set(key, { x: 1 });

    // Expect the value to be set and extended with default values
    expect(tables.Position.get(key)).toEqual({ x: 1, y: 0 });

    // Set another partial value
    tables.Position.set(key, { y: 2 });

    // Expect the value to be partially updated
    expect(tables.Position.get(key)).toEqual({ x: 1, y: 2 });
  });

  it("should remove values", () => {
    const key = { first: "0x00", second: BigInt(1) } as const;
    const value = { value: BigInt(2) };

    // Set the value
    tables.Counter.set(key, value);
    expect(tables.Counter.get(key)).toEqual(value);

    // Remove the value
    tables.Counter.remove(key);
    expect(tables.Counter.get(key)).toBeUndefined();
  });

  describe("subscribe", () => {
    it("should subscribe to updates of the selected table", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const multiKeyUpdates: KeyValue<typeof config, "MultiKey">[] = [
        { key: { first: "0x00", second: 4 }, value: { value: 1 } },
        { key: { first: "0x01", second: 3 }, value: { value: 2 } },
        { key: { first: "0x02", second: 2 }, value: { value: 3 } },
        { key: { first: "0x03", second: 1 }, value: { value: 4 } },
      ];

      const callback = vi.fn();

      // Subscribe only to updates of the Position table
      tables.Position.subscribe(callback);

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) tables.MultiKey.set(update.key, update.value);

      let i = 1;

      // Expect the callback to only have been called with updates of the PositionTable
      for (const update of positionUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, { Position: { set: [update], remove: [], table: "Position" } });
      }
      for (const update of multiKeyUpdates) {
        expect(callback).not.toHaveBeenCalledWith({
          MultiKey: { set: [update], remove: [], table: "MultiKey" },
        });
      }

      // Remove all the table entries
      for (const update of positionUpdates) tables.Position.remove(update.key);
      for (const update of multiKeyUpdates) tables.MultiKey.remove(update.key);

      // Expect the callback to only have been called with remove updates of the Position table
      for (const update of positionUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, {
          Position: { set: [], remove: [{ key: update.key }], table: "Position" },
        });
      }
      for (const update of multiKeyUpdates) {
        expect(callback).not.toHaveBeenCalledWith({
          MultiKey: { set: [], remove: [{ key: update.key }], table: "MultiKey" },
        });
      }
    });

    it("should only subscribe to updates greater than the provided key", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const callback = vi.fn();

      // Subscribe only to Position table updates greater than key "0x01"
      tables.Position.subscribe(callback, { key: { gt: { key: "0x01" } } });

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);

      // Expect the callback to only have been called with updates of a key greater than 0x01
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, {
        Position: { set: [positionUpdates[2]], remove: [], table: "Position" },
      });
      expect(callback).toHaveBeenNthCalledWith(2, {
        Position: { set: [positionUpdates[3]], remove: [], table: "Position" },
      });
    });

    it("should only subscribe to updates greater than or equal to provided key", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const callback = vi.fn();

      // Subscribe only to Position table updates greater than or equal to key "0x01"
      tables.Position.subscribe(callback, { key: { gte: { key: "0x01" } } });

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);

      // Expect the callback to only have been called with updates of a key greater than or equal to 0x01
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, {
        Position: { set: [positionUpdates[1]], remove: [], table: "Position" },
      });
      expect(callback).toHaveBeenNthCalledWith(2, {
        Position: { set: [positionUpdates[2]], remove: [], table: "Position" },
      });
      expect(callback).toHaveBeenNthCalledWith(3, {
        Position: { set: [positionUpdates[3]], remove: [], table: "Position" },
      });
    });

    it("should only subscribe to updates equal to the provided key", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const callback = vi.fn();

      // Subscribe only to Position table updates equal to key "0x01"
      tables.Position.subscribe(callback, { key: { eq: { key: "0x01" } } });

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);

      // Expect the callback to only have been called with updates of a key equal to 0x01
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenNthCalledWith(1, {
        Position: { set: [positionUpdates[1]], remove: [], table: "Position" },
      });
    });

    it("should only subscribe to updates less than or equal to the provided key", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const callback = vi.fn();

      // Subscribe only to Position table updates less than or equal to key "0x01"
      tables.Position.subscribe(callback, { key: { lte: { key: "0x01" } } });

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);

      // Expect the callback to only have been called with updates of a key less than or equal to 0x01
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, {
        Position: { set: [positionUpdates[0]], remove: [], table: "Position" },
      });
      expect(callback).toHaveBeenNthCalledWith(2, {
        Position: { set: [positionUpdates[1]], remove: [], table: "Position" },
      });
    });

    it("should only subscribe to updates less than the provided key", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const callback = vi.fn();

      // Subscribe only to Position table updates less than key "0x01"
      tables.Position.subscribe(callback, { key: { lt: { key: "0x01" } } });

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);

      // Expect the callback to only have been called with updates of a key less than 0x01
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenNthCalledWith(1, {
        Position: { set: [positionUpdates[0]], remove: [], table: "Position" },
      });
    });

    it("should not subscribe to updates anymore after unsubscribing", () => {
      const positionUpdates: KeyValue<typeof config, "Position">[] = [
        { key: { key: "0x00" }, value: { x: 1, y: 2 } },
        { key: { key: "0x01" }, value: { x: 2, y: 3 } },
        { key: { key: "0x02" }, value: { x: 3, y: 4 } },
        { key: { key: "0x03" }, value: { x: 4, y: 5 } },
      ];

      const callback = vi.fn();

      // Subscribe to all Position table updates
      const unsubscribe = tables.Position.subscribe(callback);

      // Set values in the tables
      tables.Position.set(positionUpdates[0].key, positionUpdates[0].value);
      tables.Position.set(positionUpdates[1].key, positionUpdates[1].value);

      // Unsubscribe from updates
      unsubscribe();

      // Set more values in the tables
      tables.Position.set(positionUpdates[2].key, positionUpdates[2].value);
      tables.Position.set(positionUpdates[3].key, positionUpdates[3].value);

      // Expect the callback to only have been called with updates of a key less than or equal to 0x01
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, {
        Position: { set: [positionUpdates[0]], remove: [], table: "Position" },
      });
      expect(callback).toHaveBeenNthCalledWith(2, {
        Position: { set: [positionUpdates[1]], remove: [], table: "Position" },
      });
    });
  });

  it("should expose global methods to modify values on any table", () => {
    const table = "some-other-table";
    const key = { key: "0x00" };
    const value = { someValue: 1 };

    const mock = vi.fn();

    client.subscribe(mock);

    client.set(table, key, value);
    expect(client.get(table, key)).toStrictEqual(value);

    client.remove(table, key);
    expect(client.get(table, key)).toBe(undefined);

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, {
      [table]: { set: [{ key, value }], remove: [], table },
    });
    expect(mock).toHaveBeenNthCalledWith(2, {
      [table]: { set: [], remove: [{ key }], table },
    });
  });
});
