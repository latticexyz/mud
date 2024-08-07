import { describe, expect, it } from "vitest";
import { createStore, Actions } from "./createStore";
import { attest } from "@ark/attest";
import { BoundTable } from "./createStore/getTable";
import * as actions from "./actions";

describe("store, bound table, free functions", () => {
  const store = createStore();
  const Position = store.getState().actions.registerTable({
    label: "Position",
    schema: { player: "address", x: "uint32", y: "uint32" },
    key: ["player"],
  });

  it("should expose the same functionality", () => {
    // Bound table exposes same surface as internal store
    const excludedKeys = ["registerTable", "getTable", "getTables"] as const;
    attest<keyof BoundTable, keyof Omit<Actions["actions"], (typeof excludedKeys)[number]>>();
    attest<keyof Omit<Actions["actions"], (typeof excludedKeys)[number]>, keyof BoundTable>();
    expect(Object.keys(Position)).toEqual(
      Object.keys(store.getState().actions).filter((key) => !excludedKeys.includes(key as never)),
    );

    // Free functions expose same surface as internal store
    attest<keyof typeof actions, keyof Actions["actions"]>();
    attest<keyof Actions["actions"], keyof typeof actions>();
    expect(Object.keys(actions)).toEqual(Object.keys(store.getState().actions));
  });
});
