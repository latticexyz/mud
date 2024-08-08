import { beforeEach, describe, it, vi, expect } from "vitest";
import { QueryUpdate, subscribeQuery } from "./subscribeQuery";
import { attest } from "@arktype/attest";
import { defineStore } from "@latticexyz/store";
import { In, MatchRecord } from "../queryFragments";
import { deleteRecord } from "./deleteRecord";
import { setRecord } from "./setRecord";
import { Store } from "../common";
import { createStore } from "../createStore";

describe("defineQuery", () => {
  let store: Store;
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
    store = createStore(config);

    // Add some mock data
    const items = ["gold", "silver"];
    const num = 5;
    for (let i = 0; i < num; i++) {
      setRecord({ store, table: Position, key: { player: String(i) }, record: { x: i, y: num - i } });
      if (i > 2) {
        setRecord({ store, table: Health, key: { player: String(i) }, record: { health: i } });
      }
      for (const item of items) {
        setRecord({ store, table: Inventory, key: { player: String(i), item }, record: { amount: i } });
      }
    }
  });

  it("should return the matching keys and keep it updated", () => {
    const result = subscribeQuery({ store, query: [In(Position), In(Health)] });
    attest(result.keys).snap({
      "3": { player: "3" },
      "4": { player: "4" },
    });

    setRecord({ store, table: Health, key: { player: 2 }, record: { health: 2 } });

    attest(result.keys).snap({
      "2": { player: "2" },
      "3": { player: "3" },
      "4": { player: "4" },
    });
  });

  it("should notify subscribers when a matching key is updated", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = subscribeQuery({ store, query: [MatchRecord(Position, { x: 4 }), In(Health)] });
    result.subscribe(subscriber);

    setRecord({ store, table: Position, key: { player: "4" }, record: { y: 2 } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      records: {
        namespace1: {
          Position: {
            "4": {
              prev: { player: "4", x: 4, y: 1 },
              current: { player: "4", x: 4, y: 2 },
            },
          },
        },
      },
      keys: { "4": { player: "4" } },
      types: { "4": "update" },
    });
  });

  it("should notify subscribers when a new key matches", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = subscribeQuery({ store, query: [In(Position), In(Health)] });
    result.subscribe(subscriber);

    setRecord({ store, table: Health, key: { player: 2 }, record: { health: 2 } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      records: {
        namespace1: {
          Health: {
            "2": {
              prev: undefined,
              current: { player: 2, health: 2 },
            },
          },
        },
      },
      keys: { "2": { player: "2" } },
      types: { "2": "enter" },
    });
  });

  it("should notify subscribers when a key doesn't match anymore", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = subscribeQuery({ store, query: [In(Position), In(Health)] });
    result.subscribe(subscriber);

    deleteRecord({ store, table: Position, key: { player: 3 } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      records: {
        namespace1: {
          Position: {
            "3": {
              prev: { player: "3", x: 3, y: 2 },
              current: undefined,
            },
          },
        },
      },
      keys: { "3": { player: "3" } },
      types: { "3": "exit" },
    });
  });

  it("should notify initial subscribers with initial query result", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    subscribeQuery({ store, query: [In(Position), In(Health)], options: { initialSubscribers: [subscriber] } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      keys: {
        "3": { player: "3" },
        "4": { player: "4" },
      },
      records: {
        namespace1: {
          Position: {
            "3": { prev: undefined, current: { player: "3", x: 3, y: 2 } },
            "4": { prev: undefined, current: { player: "4", x: 4, y: 1 } },
          },
          Health: {
            "3": { prev: undefined, current: { player: "3", health: 3 } },
            "4": { prev: undefined, current: { player: "4", health: 4 } },
          },
        },
      },
      types: { "3": "enter", "4": "enter" },
    });
  });
});
