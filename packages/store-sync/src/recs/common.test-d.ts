import { Component, Type as RecsType } from "@latticexyz/recs";
import { describe, expectTypeOf } from "vitest";
import storeConfig from "@latticexyz/store/mud.config";
import { ConfigToRecsComponents } from "./common";

describe("ConfigToRecsComponents", () => {
  expectTypeOf<ConfigToRecsComponents<typeof storeConfig>["Tables"]>().toEqualTypeOf<
    Component<
      {
        keySchema: RecsType.String;
        valueSchema: RecsType.String;
        abiEncodedKeyNames: RecsType.String;
        abiEncodedFieldNames: RecsType.String;
      },
      {
        componentName: "Tables";
        // TODO: fix config namespace so it comes back as a const
        tableName: `${string}:Tables`;
        keySchema: {
          tableId: "bytes32";
        };
        valueSchema: {
          keySchema: "bytes32";
          valueSchema: "bytes32";
          abiEncodedKeyNames: "bytes";
          abiEncodedFieldNames: "bytes";
        };
      }
    >
  >();
});
