import { describe, expectTypeOf } from "vitest";
import storeConfig from "@latticexyz/store/mud.config";
import { ConfigToTables } from "./common";
import { Hex } from "viem";

describe("ConfigToTables", () => {
  // TODO: fix after we have better config normalizing (https://github.com/latticexyz/mud/issues/1668)
  // expectTypeOf<ConfigToTables<typeof storeConfig>["Tables"]>().toEqualTypeOf<{
  //   tableId: Hex;
  //   namespace: "store";
  //   name: "Tables";
  //   keySchema: {
  //     tableId: "bytes32";
  //   };
  //   valueSchema: {
  //     fieldLayout: "bytes32";
  //     keySchema: "bytes32";
  //     valueSchema: "bytes32";
  //     abiEncodedKeyNames: "bytes";
  //     abiEncodedFieldNames: "bytes";
  //   };
  // }>();
});
