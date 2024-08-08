import { describe, expect, it } from "vitest";
import { createStore } from "./createStore";
import { attest } from "@ark/attest";
import { BoundTable } from "./actions/getTable";
import { DefaultActions } from "./decorators/default";

describe("store actions, bound table", () => {
  const store = createStore();
  const Position = store.registerTable({
    table: {
      label: "Position",
      schema: { player: "address", x: "uint32", y: "uint32" },
      key: ["player"],
    },
  });

  it("should expose the same functionality", () => {
    // Bound table exposes same surface as internal store
    const excludedKeys = [
      "registerTable",
      "getTable",
      "getTables",
      "extend",
      "runQuery",
      "subscribeQuery",
      "_",
      "get",
    ] as const;
    attest<keyof BoundTable, keyof Omit<DefaultActions, (typeof excludedKeys)[number]>>();
    attest<keyof Omit<DefaultActions, (typeof excludedKeys)[number]>, keyof BoundTable>();
    expect(Object.keys(Position)).toEqual(Object.keys(store).filter((key) => !excludedKeys.includes(key as never)));
  });
});
