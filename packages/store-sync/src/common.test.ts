import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToTables } from "./configToTables";

describe("mudTables", () => {
  it("has no overlapping table labels", () => {
    // TODO: is there a better way to write this test?
    attest<
      true,
      keyof configToTables<typeof storeConfig> & keyof configToTables<typeof worldConfig> extends never ? true : false
    >();
  });
});
