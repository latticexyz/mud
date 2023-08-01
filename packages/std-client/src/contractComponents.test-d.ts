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
        readonly componentName: "Vector2";
        readonly tableName: "mudstore:Vector2";
        readonly keySchema: { key: "bytes32" };
        readonly valueSchema: { x: "uint32"; y: "uint32" };
      }
    >
  >();
});
