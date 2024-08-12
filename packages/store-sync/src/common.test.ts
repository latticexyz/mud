import { describe, it } from "vitest";
import { attest } from "@ark/attest";
import { isDisjoint } from "@ark/util";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToTables } from "./configToTables";

describe("mudTables", () => {
  it("has no overlapping table labels", () => {
    attest<true, isDisjoint<keyof configToTables<typeof storeConfig>, keyof configToTables<typeof worldConfig>>>();
  });
});
