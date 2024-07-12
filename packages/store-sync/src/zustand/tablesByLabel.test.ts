import { describe, expect, it } from "vitest";
import { tablesByLabel } from "./tablesByLabel";
import { defineWorld } from "@latticexyz/world";

describe("tablesByLabel", () => {
  // Eventually, config output will truncate table names and the label will move to a `label` key.
  // This test ensures we still have tables named by their labels so we don't forget to update this code path.
  it("maps table label to component name", async () => {
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
      },
    });

    const tables = tablesByLabel(config.tables);
    expect(tables.ExceedsResourceNameSizeLimit.name).toBe("ExceedsResourceNameSizeLimit");
  });
});
