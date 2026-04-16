import { describe, expect, it } from "vitest";
import { createStash } from "./createStash";
import { attest } from "@ark/attest";
import { BoundTable } from "./actions/getTable";
import { DefaultActions } from "./decorators/defaultActions";
import { defineTable } from "@latticexyz/store/internal";

describe("stash actions, bound table", () => {
  const stash = createStash();
  const Position = stash.registerTable({
    table: defineTable({
      label: "Position",
      schema: { player: "address", x: "uint32", y: "uint32" },
      key: ["player"],
    }),
  });

  it("should expose the same functionality", () => {
    const excludedStoreKeys = [
      "registerTable",
      "registerDerivedTable",
      "registerIndex",
      "getTable",
      "getTables",
      "runQuery",
      "subscribeQuery",
      "subscribeStash",
      "subscribeTable", // renamed to subscribe in table API
      "_",
      "get",
    ] as const;

    const excludedTableKeys = [
      "subscribe", // renamed from subscribeTable in stash API
    ] as const;

    attest<
      keyof Omit<BoundTable, (typeof excludedTableKeys)[number]>,
      keyof Omit<DefaultActions, (typeof excludedStoreKeys)[number]>
    >();
    attest<
      keyof Omit<DefaultActions, (typeof excludedStoreKeys)[number]>,
      keyof Omit<BoundTable, (typeof excludedTableKeys)[number]>
    >();
    expect(Object.keys(Position).filter((key) => !excludedTableKeys.includes(key as never))).toEqual(
      Object.keys(stash).filter((key) => !excludedStoreKeys.includes(key as never)),
    );
  });
});
