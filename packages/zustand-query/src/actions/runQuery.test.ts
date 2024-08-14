import { describe, beforeEach, it } from "vitest";
import { attest } from "@arktype/attest";
import { createStore } from "../createStore";
import { runQuery } from "./runQuery";
import { defineStore } from "@latticexyz/store";
import { Store, getQueryTables } from "../common";
import { setRecord } from "./setRecord";
import { In, MatchRecord, NotIn, NotMatchRecord } from "../queryFragments";

describe("query", () => {
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
    const items = ["0xgold", "0xsilver"] as const;
    const num = 5;
    for (let i = 0; i < num; i++) {
      setRecord({ store, table: Position, key: { player: `0x${String(i)}` }, record: { x: i, y: num - i } });
      if (i > 2) {
        setRecord({ store, table: Health, key: { player: `0x${String(i)}` }, record: { health: i } });
      }
      for (const item of items) {
        setRecord({ store, table: Inventory, key: { player: `0x${String(i)}`, item }, record: { amount: i } });
      }
    }
  });

  it("should return all keys in the Position table", () => {
    const result = runQuery({ store, query: [In(Position)] });
    attest(result).snap({
      keys: {
        "0x0": { player: "0x0" },
        "0x1": { player: "0x1" },
        "0x2": { player: "0x2" },
        "0x3": { player: "0x3" },
        "0x4": { player: "0x4" },
      },
    });

    Position.namespaceLabel;
    const query = [In(Position), In(Health)] as const;
    const test = {} as getQueryTables<typeof query>;
    test;
  });

  it("should return all keys that are in the Position and Health table", () => {
    const result = runQuery({ store, query: [In(Position), In(Health)] });
    attest(result).snap({
      keys: {
        "0x3": { player: "0x3" },
        "0x4": { player: "0x4" },
      },
    });
  });

  it("should return all keys that have Position.x = 4 and are included in Health", () => {
    const result = runQuery({ store, query: [MatchRecord(Position, { x: 4 }), In(Health)] });
    attest(result).snap({ keys: { "0x4": { player: "0x4" } } });
  });

  it("should return all keys that are in Position but not Health", () => {
    const result = runQuery({ store, query: [In(Position), NotIn(Health)] });
    attest(result).snap({
      keys: {
        "0x0": { player: "0x0" },
        "0x1": { player: "0x1" },
        "0x2": { player: "0x2" },
      },
    });
  });

  it("should return all keys that don't include a gold item in the Inventory table", () => {
    const result = runQuery({ store, query: [NotMatchRecord(Inventory, { item: "0xgold" })] });
    attest(result).snap({
      keys: {
        "0x0|0xsilver": { player: "0x0", item: "0xsilver" },
        "0x1|0xsilver": { player: "0x1", item: "0xsilver" },
        "0x2|0xsilver": { player: "0x2", item: "0xsilver" },
        "0x3|0xsilver": { player: "0x3", item: "0xsilver" },
        "0x4|0xsilver": { player: "0x4", item: "0xsilver" },
      },
    });
  });

  it("should throw an error when tables with different key schemas are mixed", () => {
    attest(() =>
      runQuery({ store, query: [In(Position), MatchRecord(Inventory, { item: "0xgold", amount: 2 })] }),
    ).throws("All tables in a query must share the same key schema");
  });

  it("should include all matching records from the tables if includeRecords is set", () => {
    const result = runQuery({ store, query: [In(Position), In(Health)], options: { includeRecords: true } });
    attest(result).snap({
      keys: {
        "0x3": { player: "0x3" },
        "0x4": { player: "0x4" },
      },
      records: {
        namespace1: {
          Position: {
            "0x3": { player: "0x3", x: 3, y: 2 },
            "0x4": { player: "0x4", x: 4, y: 1 },
          },
          Health: {
            "0x3": { player: "0x3", health: 3 },
            "0x4": { player: "0x4", health: 4 },
          },
        },
      },
    });
  });
});
