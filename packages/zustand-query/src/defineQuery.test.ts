import { beforeEach, describe, it } from "vitest";
import { defineQuery } from "./defineQuery";
import { BoundTable, Store, createStore } from "./createStore";
import { In } from "./queryFragments";
import { attest } from "@arktype/attest";

describe("defineQuery", () => {
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
});
