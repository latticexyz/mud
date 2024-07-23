import { beforeEach, describe, it, vi, expect } from "vitest";
import { QueryUpdate, defineQuery } from "./defineQuery";
import { BoundTable, Store, createStore } from "./createStore";
import { In, MatchRecord } from "./queryFragments";
import { attest } from "@arktype/attest";
import { defineStore } from "@latticexyz/store";

describe("defineQuery", () => {
  let store: Store;
  let Position: BoundTable;
  let Health: BoundTable;
  let Inventory: BoundTable;

  beforeEach(() => {
    store = createStore(
      defineStore({
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
      }),
    );

    Position = store.getState().actions.getTable({ namespace: "namespace1", label: "Position" });
    Health = store.getState().actions.getTable({ namespace: "namespace1", label: "Health" });
    Inventory = store.getState().actions.getTable({ namespace: "namespace1", label: "Inventory" });

    // Add some mock data
    const items = ["gold", "silver"];
    const num = 5;
    for (let i = 0; i < num; i++) {
      Position.setRecord({ key: { player: String(i) }, record: { x: i, y: num - i } });
      if (i > 2) {
        Health.setRecord({ key: { player: String(i) }, record: { health: i } });
      }
      for (const item of items) {
        Inventory.setRecord({ key: { player: String(i), item }, record: { amount: i } });
      }
    }
  });

  it("should return the matching keys and keep it updated", () => {
    const result = defineQuery([In(Position), In(Health)]);
    attest(result.keys).snap({
      "3": { player: "3" },
      "4": { player: "4" },
    });

    Health.setRecord({ key: { player: 2 }, record: { health: 2 } });

    attest(result.keys).snap({
      "2": { player: "2" },
      "3": { player: "3" },
      "4": { player: "4" },
    });
  });

  it("should notify subscribers when a matching key is updated", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = defineQuery([MatchRecord(Position, { x: 4 }), In(Health)]);
    result.subscribe(subscriber);

    Position.setRecord({ key: { player: "4" }, record: { y: 2 } });

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
    const result = defineQuery([In(Position), In(Health)]);
    result.subscribe(subscriber);

    Health.setRecord({ key: { player: 2 }, record: { health: 2 } });

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
    const result = defineQuery([In(Position), In(Health)]);
    result.subscribe(subscriber);

    Position.deleteRecord({ key: { player: 3 } });

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
    defineQuery([In(Position), In(Health)], { initialSubscribers: [subscriber] });

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