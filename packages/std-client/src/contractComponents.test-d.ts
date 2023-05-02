import { Component, Type as RecsType } from "@latticexyz/recs";
import { describe, expectTypeOf } from "vitest";
import { defineContractComponents } from "./mud-definitions/store/contractComponents";

type StoreContractComponents = ReturnType<typeof defineContractComponents>;

describe("store/contractComponents", () => {
  expectTypeOf<StoreContractComponents["Vector2"]>().toEqualTypeOf<
    Component<
      {
        x: RecsType.Number;
        y: RecsType.Number;
      },
      {
        contractId: `0x${string}`;
        tableId: string;
      },
      undefined
    >
  >();
});
