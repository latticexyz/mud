import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { createDatabase, createDatabaseClient } from ".";
import { mudConfig } from "@latticexyz/store/register";
import { KeyValue } from "./types";

const config = mudConfig({
  namespace: "somenamespace",
  tables: {
    Counter: { keySchema: { first: "bytes32", second: "uint256" }, schema: "uint256" },
    Position: { schema: { x: "int32", y: "int32" } },
    MultiKey: { keySchema: { first: "bytes32", second: "uint32" }, schema: "int32" },
    EnumTable: { keySchema: { first: "Enum1" }, schema: "Enum2" },
    MultiTable: { schema: { arr: "int32[]", str: "string", bts: "bytes" } },
    BigInt: { keySchema: { first: "uint256" }, schema: "uint256" },
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

    it("should create a typed union for updates", () => {
      client.subscribe((updates) => {
        const update = updates[0];
        if (update.table === "Position") expectTypeOf(update.set[0].value).toMatchTypeOf<{ x: number; y: number }>();
        if (update.table === "Counter") expectTypeOf(update.set[0].value).toMatchTypeOf<{ value: bigint }>();
        if (update.table === "EnumTable") expectTypeOf(update.set[0].key).toMatchTypeOf<{ first: number }>();
        if (update.table === "MultiKey")
          expectTypeOf(update.set[0].key).toMatchTypeOf<{ first: string; second: number }>();
      });
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
    const key1 = { key: "0x00" } as const;
    const key2 = { first: "0x00", second: 1n } as const;

    // Set a partial value
    tables.Position.set(key1, {});

    // Expect the value to be initialized with default values
    expect(tables.Position.get(key1)).toEqual({ x: 0, y: 0 });

    // Set a partial value and expect the value to be initialized with default values
    tables.Counter.set(key2, {});
    expect(tables.Counter.get(key2)).toEqual({ value: 0n });

    // Set a partial value and expect the value to be initialized with default values
    tables.MultiTable.set(key1, {});
    expect(tables.MultiTable.get(key1)).toEqual({ arr: [], str: "", bts: "0x" });
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

  describe("scan", () => {
    it("should return all the values of the selected table", () => {
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

      // Set values in the tables
      for (const update of positionUpdates) tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) tables.MultiKey.set(update.key, update.value);

      expect(tables.Position.scan()).toEqual(
        positionUpdates.map(({ key, value }) => ({ key, value, namespace: config.namespace, table: "Position" }))
      );
    });

    it("should return a list of all database entries", () => {
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

      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);

      const rows = client.scan();

      expect(rows.length).toBe(positionUpdates.length + multiKeyUpdates.length);
      expect(rows).toEqual([
        ...multiKeyUpdates.map((row) => ({ ...row, namespace: config["namespace"], table: "MultiKey" })),
        ...positionUpdates.map((row) => ({ ...row, namespace: config["namespace"], table: "Position" })),
      ]);
    });
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
        expect(callback).toHaveBeenNthCalledWith(i++, [
          { set: [update], remove: [], table: "Position", namespace: config.namespace },
        ]);
      }
      for (const update of multiKeyUpdates) {
        expect(callback).not.toHaveBeenCalledWith([
          { set: [update], remove: [], table: "MultiKey", namespace: config.namespace },
        ]);
      }

      // Remove all the table entries
      for (const update of positionUpdates) tables.Position.remove(update.key);
      for (const update of multiKeyUpdates) tables.MultiKey.remove(update.key);

      // Expect the callback to only have been called with remove updates of the Position table
      for (const update of positionUpdates) {
        expect(callback).toHaveBeenNthCalledWith(i++, [
          { set: [], remove: [{ key: update.key }], table: "Position", namespace: config.namespace },
        ]);
      }
      for (const update of multiKeyUpdates) {
        expect(callback).not.toHaveBeenCalledWith([
          { set: [], remove: [{ key: update.key }], table: "MultiKey", namespace: config.namespace },
        ]);
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
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: [positionUpdates[2]], remove: [], table: "Position", namespace: config.namespace },
      ]);
      expect(callback).toHaveBeenNthCalledWith(2, [
        { set: [positionUpdates[3]], remove: [], table: "Position", namespace: config.namespace },
      ]);
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
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: [positionUpdates[1]], remove: [], table: "Position", namespace: config.namespace },
      ]);
      expect(callback).toHaveBeenNthCalledWith(2, [
        { set: [positionUpdates[2]], remove: [], table: "Position", namespace: config.namespace },
      ]);
      expect(callback).toHaveBeenNthCalledWith(3, [
        { set: [positionUpdates[3]], remove: [], table: "Position", namespace: config.namespace },
      ]);
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
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: [positionUpdates[1]], remove: [], table: "Position", namespace: config.namespace },
      ]);
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
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: [positionUpdates[0]], remove: [], table: "Position", namespace: config.namespace },
      ]);
      expect(callback).toHaveBeenNthCalledWith(2, [
        { set: [positionUpdates[1]], remove: [], table: "Position", namespace: config.namespace },
      ]);
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
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: [positionUpdates[0]], remove: [], table: "Position", namespace: config.namespace },
      ]);
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
      expect(callback).toHaveBeenNthCalledWith(1, [
        { set: [positionUpdates[0]], remove: [], table: "Position", namespace: config.namespace },
      ]);
      expect(callback).toHaveBeenNthCalledWith(2, [
        { set: [positionUpdates[1]], remove: [], table: "Position", namespace: config.namespace },
      ]);
    });
  });

  it("should expose global methods to modify values on any table", () => {
    const namespace = "some-other-namespace";
    const table = "some-other-table";
    const key = { key: "0x00" };
    const value = { someValue: 1 };

    const mock = vi.fn();

    client.subscribe(mock);

    client.set(namespace, table, key, value);
    expect(client.get(namespace, table, key)).toStrictEqual(value);

    client.remove(namespace, table, key);
    expect(client.get(namespace, table, key)).toBe(undefined);

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, [{ set: [{ key, value }], remove: [], table, namespace }]);
    expect(mock).toHaveBeenNthCalledWith(2, [{ set: [], remove: [{ key }], table, namespace }]);
  });

  // TODO: Remove bigint seralization to allow filter based on numeric value of bigints (see https://github.com/latticexyz/mud/issues/816)
  // Requires bigint keys to be supported by `tuple-database`, see https://github.com/ccorcos/tuple-database/issues/2
  // For now we serialize bigints to use them as keys, which changes the comparison (eg. 2n < 10n but "2n" > "10n")
  it.skip("should be possible to filter based on bigint keys", () => {
    const mock = vi.fn();

    // Subscribe to key values larger than 10n
    tables.BigInt.subscribe(mock, { key: { gt: { first: 10n } } });

    // Set a couple values on various keys
    tables.BigInt.set({ first: 1n }, { value: 1n }); // should not be subscribed to
    tables.BigInt.set({ first: 2n }, { value: 2n }); // should not be subscribed to
    tables.BigInt.set({ first: 10n }, { value: 10n }); // should not be subscribed to
    tables.BigInt.set({ first: 11n }, { value: 11n }); // should be subscribed to

    // Expect mock to only have been called with keys greater than 10n
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenNthCalledWith(1, [
      {
        set: [{ key: { first: 11n }, value: { value: 11n } }],
        remove: [],
        table: "BigInt",
        namespace: config.namespace,
      },
    ]);
  });
});
