import { beforeEach, describe, it, vi, expect } from "vitest";
import { QueryUpdate, subscribeQuery } from "./subscribeQuery";
import { attest } from "@arktype/attest";
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
  });

  it("should return the matching keys and keep it updated", () => {
    const result = subscribeQuery({ stash, query: [In(Position), In(Health)] });
    attest(result.keys).snap({
      "0x3": { player: "0x3" },
      "0x4": { player: "0x4" },
    });

    setRecord({ stash, table: Health, key: { player: `0x2` }, value: { health: 2 } });

    attest(result.keys).snap({
      "0x2": { player: "0x2" },
      "0x3": { player: "0x3" },
      "0x4": { player: "0x4" },
    });
  });

  it("should notify subscribers when a matching key is updated", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = subscribeQuery({ stash, query: [Matches(Position, { x: 4 }), In(Health)] });
    result.subscribe(subscriber);

    setRecord({ stash, table: Position, key: { player: "0x4" }, value: { y: 2 } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      records: {
        namespace1: {
          Position: {
            "0x4": {
              prev: { player: "0x4", x: 4, y: 1 },
              current: { player: "0x4", x: 4, y: 2 },
            },
          },
        },
      },
      keys: { "0x4": { player: "0x4" } },
      types: { "0x4": "update" },
    });
  });

  it("should notify subscribers when a new key matches", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = subscribeQuery({ stash, query: [In(Position), In(Health)] });
    result.subscribe(subscriber);

    setRecord({ stash, table: Health, key: { player: `0x2` }, value: { health: 2 } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      records: {
        namespace1: {
          Health: {
            "0x2": {
              prev: undefined,
              current: { player: `0x2`, health: 2 },
            },
          },
        },
      },
      keys: { "0x2": { player: "0x2" } },
      types: { "0x2": "enter" },
    });
  });

  it("should notify subscribers when a key doesn't match anymore", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    const result = subscribeQuery({ stash, query: [In(Position), In(Health)] });
    result.subscribe(subscriber);

    deleteRecord({ stash, table: Position, key: { player: `0x3` } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      records: {
        namespace1: {
          Position: {
            "0x3": {
              prev: { player: "0x3", x: 3, y: 2 },
              current: undefined,
            },
          },
        },
      },
      keys: { "0x3": { player: "0x3" } },
      types: { "0x3": "exit" },
    });
  });

  it("should notify initial subscribers with initial query result", () => {
    let lastUpdate: unknown;
    const subscriber = vi.fn((update: QueryUpdate) => (lastUpdate = update));
    subscribeQuery({ stash, query: [In(Position), In(Health)], options: { initialSubscribers: [subscriber] } });

    expect(subscriber).toBeCalledTimes(1);
    attest(lastUpdate).snap({
      keys: {
        "0x3": { player: "0x3" },
        "0x4": { player: "0x4" },
      },
      records: {
        namespace1: {
          Position: {
            "0x3": { prev: undefined, current: { player: "0x3", x: 3, y: 2 } },
            "0x4": { prev: undefined, current: { player: "0x4", x: 4, y: 1 } },
          },
          Health: {
            "0x3": { prev: undefined, current: { player: "0x3", health: 3 } },
            "0x4": { prev: undefined, current: { player: "0x4", health: 4 } },
          },
        },
      },
      types: { "0x3": "enter", "0x4": "enter" },
    });
  });
});
