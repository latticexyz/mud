import { Component, Type as RecsType } from "@latticexyz/recs";
import { describe, expectTypeOf } from "vitest";
import storeConfig from "@latticexyz/store/mud.config.js";
import { ConfigToRecsComponents } from "./common";

describe("ConfigToRecsComponents", () => {
  expectTypeOf<ConfigToRecsComponents<typeof storeConfig>["StoreMetadata"]>().toEqualTypeOf<
    Component<
      {
        tableName: RecsType.String;
        abiEncodedFieldNames: RecsType.String;
      },
      {
        componentName: "StoreMetadata";
        // TODO: fix config namespace so it comes back as a const
        tableName: `${string}:StoreMetadata`;
        keySchema: { tableId: "bytes32" };
        valueSchema: { tableName: "string"; abiEncodedFieldNames: "bytes" };
      }
    >
  >();
});
