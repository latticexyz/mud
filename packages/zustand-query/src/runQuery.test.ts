import { describe, beforeEach, it } from "vitest";
import { attest } from "@arktype/attest";
import { BoundTable, Store, createStore } from "./createStore";
import { runQuery } from "./runQuery";
import { In, MatchRecord } from "./queryFragments";

describe("runQuery", () => {
  let store: Store;
  let Position: BoundTable;
  let Health: BoundTable;
  let Inventory: BoundTable;

  beforeEach(() => {
    store = createStore({
      namespace1: {
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

    Position = store.getState().actions.getTable({ namespace: "namespace1", label: "Position" });
    Health = store.getState().actions.getTable({ namespace: "namespace1", label: "Health" });
    Inventory = store.getState().actions.getTable({ namespace: "namespace1", label: "Inventory" });

    console.log(store.getState());

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

  it("should return all keys in the Position table", () => {
    const result = runQuery([In(Position)]);
    attest(result).snap({
      keys: {
        "0": { player: "0" },
        "1": { player: "1" },
        "2": { player: "2" },
        "3": { player: "3" },
        "4": { player: "4" },
      },
    });
  });

  it("should return all keys that are in the Position and Health table", () => {
    const result = runQuery([In(Position), In(Health)]);
    attest(result).snap({
      keys: {
        "3": { player: "3" },
        "4": { player: "4" },
      },
    });
  });

  it("should throw an error when tables with different key schemas are mixed", () => {
    attest(() => runQuery([In(Position), MatchRecord(Inventory, { item: "gold", amount: 2 })])).throws(
      "All tables in a query must share the same key schema",
    );
  });
});
