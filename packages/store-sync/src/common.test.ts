import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { isDisjoint } from "@arktype/util";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToTables } from "./configToTables";

describe("mudTables", () => {
  it("has no overlapping table labels", () => {
    attest<true, isDisjoint<keyof configToTables<typeof storeConfig>, keyof configToTables<typeof worldConfig>>>();
  });
});
