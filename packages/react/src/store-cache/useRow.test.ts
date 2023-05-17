import { renderHook, act } from "@testing-library/react-hooks";
import { UseRowFilterOptions, useRow } from "./useRow";
import { mudConfig } from "@latticexyz/store/register";
import { KeyValue, createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import { describe, it, beforeEach, expect } from "vitest";

const config = mudConfig({
  tables: {
    MultiKey: { keySchema: { first: "bytes32", second: "uint32" }, schema: "int32" },
    Position: { schema: { x: "int32", y: "int32" } },
  },
});

describe("useRow", () => {
  let db: ReturnType<typeof createDatabase>;
  let client: ReturnType<typeof createDatabaseClient<typeof config>>;

  beforeEach(() => {
    db = createDatabase();
    client = createDatabaseClient(db, config);
  });

  it("should return the row of the position table with the specified key", () => {
    const { result } = renderHook(() => useRow(client, { table: "Position", key: { key: "0x01" } }));
    expect(result.current).toBe(undefined);

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

    act(() => {
      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);
    });

    expect(result.current).toEqual({
      key: { key: "0x01" },
      value: { x: 2, y: 3 },
      namespace: config["namespace"],
      table: "Position",
    });

    act(() => {
      for (const update of positionUpdates.slice(0, 3)) client.tables.Position.remove(update.key);
    });

    expect(result.current).toBe(undefined);
  });

  it("should re-render only when the position value of the specified key changes", () => {
    const { result } = renderHook(() => useRow(client, { table: "Position", key: { key: "0x00" } }));
    expect(result.all.length).toBe(2);

    // Update the position table
    act(() => {
      client.tables.Position.set({ key: "0x00" }, { x: 1, y: 2 });
    });
    expect(result.all.length).toBe(3);
    expect(result.current).toEqual({
      key: { key: "0x00" },
      value: { x: 1, y: 2 },
      namespace: config["namespace"],
      table: "Position",
    });

    // Update an unrelated table
    act(() => {
      client.tables.MultiKey.set({ first: "0x03", second: 1 }, { value: 4 });
    });
    expect(result.all.length).toBe(3);
    expect(result.current).toEqual({
      key: { key: "0x00" },
      value: { x: 1, y: 2 },
      namespace: config["namespace"],
      table: "Position",
    });

    // Update the position table
    act(() => {
      client.tables.Position.set({ key: "0x00" }, { x: 2, y: 2 });
    });
    expect(result.all.length).toBe(4);
    expect(result.current).toEqual({
      key: { key: "0x00" },
      value: { x: 2, y: 2 },
      namespace: config["namespace"],
      table: "Position",
    });

    // Update an unrelated key
    act(() => {
      client.tables.Position.set({ key: "0x01" }, { x: 2, y: 2 });
    });
    expect(result.all.length).toBe(4);
    expect(result.current).toEqual({
      key: { key: "0x00" },
      value: { x: 2, y: 2 },
      namespace: config["namespace"],
      table: "Position",
    });

    // Update the position table
    act(() => {
      client.tables.Position.remove({ key: "0x00" });
    });
    expect(result.all.length).toBe(5);
    expect(result.current).toEqual(undefined);
  });

  it("should re-render when the filter changes", () => {
    const { result, rerender } = renderHook(({ filter }) => useRow(client, filter), {
      initialProps: {
        filter: { table: "Position", key: { key: "0x01" } } as UseRowFilterOptions<typeof config>,
      },
    });

    expect(result.all.length).toBe(2);
    expect(result.current).toBe(undefined);

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

    act(() => {
      // Set values in the tables
      for (const update of positionUpdates) client.tables.Position.set(update.key, update.value);
      for (const update of multiKeyUpdates) client.tables.MultiKey.set(update.key, update.value);
    });

    expect(result.all.length).toBe(3);
    expect(result.current).toEqual({
      key: { key: "0x01" },
      value: { x: 2, y: 3 },
      namespace: config["namespace"],
      table: "Position",
    });

    // Change the filter
    rerender({ filter: { table: "Position", key: { key: "0x02" } } });

    // Expect hook to rerender three times:
    // 1. New prop, everything else changes the same
    // 2. `filterMemo` is updated by `useDeepMemo` because of the new prop
    // 3. `useEffect` runs because of the new `filterMemo`, scan is executed, new rows are returned
    expect(result.all.length).toBe(6);
    expect(result.current).toEqual({
      key: { key: "0x02" },
      value: { x: 3, y: 4 },
      namespace: config["namespace"],
      table: "Position",
    });

    // Change the filter
    rerender({ filter: { table: "MultiKey", key: { first: "0x00", second: 4 } } });

    expect(result.all.length).toBe(9);
    expect(result.current).toEqual({
      key: { first: "0x00", second: 4 },
      value: { value: 1 },
      namespace: config["namespace"],
      table: "MultiKey",
    });
  });
});
