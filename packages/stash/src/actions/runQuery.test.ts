import { describe, beforeEach, it } from "vitest";
import { attest } from "@arktype/attest";
import { createStash } from "../createStash";
import { runQuery } from "./runQuery";
import { defineStore } from "@latticexyz/store";
import { Stash, StoreRecords, getQueryConfig } from "../common";
import { setRecord } from "./setRecord";
import { In, Matches, Not } from "../queryFragments";
import { Hex } from "viem";

describe("runQuery", () => {
  let stash: Stash;
  const config = defineStore({
    namespaces: {
      namespace1: {
        tables: {
          Position: {
            schema: { player: "bytes32", x: "int32", y: "int32" },
            key: ["player"],
          },
        },
      },
      namespace2: {
        tables: {
          Inventory: {
            schema: { player: "bytes32", item: "bytes32", amount: "uint32" },
            key: ["player", "item"],
          },
          Health: {
            schema: { player: "bytes32", health: "uint32" },
            key: ["player"],
          },
        },
      },
    },
  });

  const { Position } = config.namespaces.namespace1.tables;
  const { Inventory, Health } = config.namespaces.namespace2.tables;

  beforeEach(() => {
    stash = createStash(config);

    // Add some mock data
    const items = ["0xgold", "0xsilver"] as const;
    const num = 5;
    for (let i = 0; i < num; i++) {
      setRecord({ stash, table: Position, key: { player: `0x${String(i)}` }, record: { x: i, y: num - i } });
      if (i > 2) {
        setRecord({ stash, table: Health, key: { player: `0x${String(i)}` }, record: { health: i } });
      }
      for (const item of items) {
        setRecord({ stash, table: Inventory, key: { player: `0x${String(i)}`, item }, record: { amount: i } });
      }
    }
  });

  it("should return all keys in the Position table", () => {
    const result = runQuery({ stash, query: [In(Position)] });
    attest(result).snap({
      keys: {
        "0x0": { player: "0x0" },
        "0x1": { player: "0x1" },
        "0x2": { player: "0x2" },
        "0x3": { player: "0x3" },
        "0x4": { player: "0x4" },
      },
    });
  });

  it("should return all keys that are in the Position and Health table", () => {
    const result = runQuery({ stash, query: [In(Position), In(Health)] });
    attest(result).snap({
      keys: {
        "0x3": { player: "0x3" },
        "0x4": { player: "0x4" },
      },
    });
  });

  it("should return all keys that have Position.x = 4 and are included in Health", () => {
    const result = runQuery({ stash, query: [Matches(Position, { x: 4 }), In(Health)] });
    attest(result).snap({ keys: { "0x4": { player: "0x4" } } });
  });

  it("should return all keys that are in Position but not Health", () => {
    const result = runQuery({ stash, query: [In(Position), Not(In(Health))] });
    attest(result).snap({
      keys: {
        "0x0": { player: "0x0" },
        "0x1": { player: "0x1" },
        "0x2": { player: "0x2" },
      },
    });
  });

  it("should return all keys that don't include a gold item in the Inventory table", () => {
    const result = runQuery({ stash, query: [Not(Matches(Inventory, { item: "0xgold" }))] });
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
    attest(() => runQuery({ stash, query: [In(Position), Matches(Inventory, { item: "0xgold", amount: 2 })] })).throws(
      "All tables in a query must share the same key schema",
    );
  });

  it("should include all matching records from the tables if includeRecords is set", () => {
    const result = runQuery({ stash, query: [In(Position), In(Health)], options: { includeRecords: true } });
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
        },
        namespace2: {
          Health: {
            "0x3": { player: "0x3", health: 3 },
            "0x4": { player: "0x4", health: 4 },
          },
        },
      },
    });
  });

  it("should include `records` only if the `includeRecords` option is provided", () => {
    const query = [In(Position)] as const;
    const resultWithoutRecords = runQuery({ stash, query });
    attest<never | undefined, (typeof resultWithoutRecords)["records"]>();

    const resultWithRecords = runQuery({ stash, query, options: { includeRecords: true } });
    attest<StoreRecords<getQueryConfig<typeof query>>, (typeof resultWithRecords)["records"]>();
  });

  it("should type the `records` in the result based on tables in the query", () => {
    const result = runQuery({ stash, query: [In(Position), In(Health)], options: { includeRecords: true } });

    attest<"namespace1" | "namespace2", keyof (typeof result)["records"]>();
    attest<"Position", keyof (typeof result)["records"]["namespace1"]>();
    attest<"Health", keyof (typeof result)["records"]["namespace2"]>();
    attest<{ player: Hex; x: number; y: number }, (typeof result)["records"]["namespace1"]["Position"][string]>();
    attest<{ player: Hex; health: number }, (typeof result)["records"]["namespace2"]["Health"][string]>();
  });
});
