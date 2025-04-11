import { beforeEach, describe, it, vi, expect } from "vitest";
import { QueryUpdates, subscribeQuery } from "./subscribeQuery";
import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { In, Matches } from "../queryFragments";
import { deleteRecord } from "./deleteRecord";
import { setRecord } from "./setRecord";
import { Stash } from "../common";
import { createStash } from "../createStash";

describe("defineQuery", () => {
  let stash: Stash;
  const config = defineStore({
    namespace: "namespace1",
    tables: {
      Position: {
        schema: { player: "bytes32", x: "int32", y: "int32" },
        key: ["player"],
      },
      Health: {
        schema: { player: "bytes32", health: "uint32" },
        key: ["player"],
      },
      Inventory: {
        schema: { player: "bytes32", item: "bytes32", amount: "uint32" },
        key: ["player", "item"],
      },
    },
  });

  const { Position, Health, Inventory } = config.namespaces.namespace1.tables;

  beforeEach(() => {
    stash = createStash(config);
    vi.useFakeTimers({ toFake: ["queueMicrotask"] });

    // Add some mock data
    const items = ["0xgold", "0xsilver"] as const;
    const num = 5;
    for (let i = 0; i < num; i++) {
      setRecord({ stash, table: Position, key: { player: `0x${String(i)}` }, value: { x: i, y: num - i } });
      if (i > 2) {
        setRecord({ stash, table: Health, key: { player: `0x${String(i)}` }, value: { health: i } });
      }
      for (const item of items) {
        setRecord({ stash, table: Inventory, key: { player: `0x${String(i)}`, item }, value: { amount: i } });
      }
    }

    vi.advanceTimersToNextTimer();
  });

  it("should return the matching keys and keep it updated", () => {
    const result = subscribeQuery({ stash, query: [In(Position), In(Health)] });
    attest(result.keys).snap({
      "0x3": { player: "0x3" },
      "0x4": { player: "0x4" },
    });

    setRecord({ stash, table: Health, key: { player: `0x2` }, value: { health: 2 } });
    vi.advanceTimersToNextTimer();

    attest(result.keys).snap({ "0x3": { player: "0x3" }, "0x4": { player: "0x4" }, "0x2": { player: "0x2" } });
  });

  it("should notify subscribers when a matching key is updated", () => {
    let lastUpdates: unknown;
    const subscriber = vi.fn((updates: QueryUpdates) => (lastUpdates = updates));

    subscribeQuery({
      stash,
      query: [Matches(Position, { x: 4 }), In(Health)],
      subscriber,
    });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdates).snap([{ key: { player: "0x4" }, type: "enter" }]);

    setRecord({ stash, table: Position, key: { player: "0x4" }, value: { y: 2 } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toBeCalledTimes(2);
    attest(lastUpdates).snap([
      {
        table: {
          label: "Position",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Position",
          tableId: "0x74626e616d6573706163653100000000506f736974696f6e0000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            x: { type: "int32", internalType: "int32" },
            y: { type: "int32", internalType: "int32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
          deploy: { disabled: false },
        },
        key: { player: "0x4" },
        previous: { player: "0x4", x: 4, y: 1 },
        current: { player: "0x4", x: 4, y: 2 },
        type: "update",
      },
    ]);
  });

  it("should notify subscribers when a new key matches", () => {
    let lastUpdates: unknown;
    const subscriber = vi.fn((updates: QueryUpdates) => (lastUpdates = updates));
    subscribeQuery({ stash, query: [In(Position), In(Health)], subscriber });

    vi.advanceTimersToNextTimer();
    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdates).snap([
      { key: { player: "0x3" }, type: "enter" },
      { key: { player: "0x4" }, type: "enter" },
    ]);

    setRecord({ stash, table: Health, key: { player: `0x2` }, value: { health: 2 } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toBeCalledTimes(2);
    attest(lastUpdates).snap([
      {
        table: {
          label: "Health",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Health",
          tableId: "0x74626e616d65737061636531000000004865616c746800000000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            health: { type: "uint32", internalType: "uint32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: false },
          deploy: { disabled: false },
        },
        key: { player: "0x2" },
        previous: "(undefined)",
        current: { player: "0x2", health: 2 },
        type: "enter",
      },
    ]);
  });

  it("should notify subscribers when a key doesn't match anymore", () => {
    let lastUpdates: unknown;
    const subscriber = vi.fn((updates: QueryUpdates) => (lastUpdates = updates));
    subscribeQuery({ stash, query: [In(Position), In(Health)], subscriber });

    vi.advanceTimersToNextTimer();
    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdates).snap([
      { key: { player: "0x3" }, type: "enter" },
      { key: { player: "0x4" }, type: "enter" },
    ]);

    deleteRecord({ stash, table: Position, key: { player: `0x3` } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toBeCalledTimes(2);
    attest(lastUpdates).snap([
      {
        table: {
          label: "Position",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Position",
          tableId: "0x74626e616d6573706163653100000000506f736974696f6e0000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            x: { type: "int32", internalType: "int32" },
            y: { type: "int32", internalType: "int32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
          deploy: { disabled: false },
        },
        key: { player: "0x3" },
        previous: { player: "0x3", x: 3, y: 2 },
        current: "(undefined)",
        type: "exit",
      },
    ]);
  });

  it("should notify initial subscribers with initial query result", () => {
    let lastUpdates: unknown;
    const subscriber = vi.fn((updates: QueryUpdates) => (lastUpdates = updates));
    subscribeQuery({ stash, query: [In(Position), In(Health)], subscriber });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdates).snap([
      { key: { player: "0x3" }, type: "enter" },
      { key: { player: "0x4" }, type: "enter" },
    ]);
  });

  it("should notify once for multiple updates", () => {
    let lastUpdates: unknown;
    const subscriber = vi.fn((updates: QueryUpdates) => (lastUpdates = updates));
    subscribeQuery({ stash, query: [In(Position), In(Health)], subscriber });

    vi.advanceTimersToNextTimer();
    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdates).snap([
      { key: { player: "0x3" }, type: "enter" },
      { key: { player: "0x4" }, type: "enter" },
    ]);

    // Update multiple records but only advance timer once
    setRecord({ stash, table: Health, key: { player: `0x2` }, value: { health: 2 } });
    setRecord({ stash, table: Health, key: { player: `0x1` }, value: { health: 1 } });
    setRecord({ stash, table: Position, key: { player: `0x1` }, value: { x: 1, y: 2 } });
    setRecord({ stash, table: Position, key: { player: `0x2` }, value: { x: 2, y: 3 } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toBeCalledTimes(2);
    attest(lastUpdates).snap([
      {
        table: {
          label: "Health",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Health",
          tableId: "0x74626e616d65737061636531000000004865616c746800000000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            health: { type: "uint32", internalType: "uint32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: false },
          deploy: { disabled: false },
        },
        key: { player: "0x2" },
        previous: "(undefined)",
        current: { player: "0x2", health: 2 },
        type: "enter",
      },
      {
        table: {
          label: "Health",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Health",
          tableId: "0x74626e616d65737061636531000000004865616c746800000000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            health: { type: "uint32", internalType: "uint32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: false },
          deploy: { disabled: false },
        },
        key: { player: "0x1" },
        previous: "(undefined)",
        current: { player: "0x1", health: 1 },
        type: "enter",
      },
      {
        table: {
          label: "Position",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Position",
          tableId: "0x74626e616d6573706163653100000000506f736974696f6e0000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            x: { type: "int32", internalType: "int32" },
            y: { type: "int32", internalType: "int32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
          deploy: { disabled: false },
        },
        key: { player: "0x1" },
        previous: { player: "0x1", x: 1, y: 4 },
        current: { player: "0x1", x: 1, y: 2 },
        type: "update",
      },
      {
        table: {
          label: "Position",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "Position",
          tableId: "0x74626e616d6573706163653100000000506f736974696f6e0000000000000000",
          schema: {
            player: { type: "bytes32", internalType: "bytes32" },
            x: { type: "int32", internalType: "int32" },
            y: { type: "int32", internalType: "int32" },
          },
          key: ["player"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
          deploy: { disabled: false },
        },
        key: { player: "0x2" },
        previous: { player: "0x2", x: 2, y: 3 },
        current: { player: "0x2", x: 2, y: 3 },
        type: "update",
      },
    ]);
  });
});
