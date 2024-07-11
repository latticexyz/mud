import { describe, expect, it } from "vitest";
import { createWorld } from "@latticexyz/recs";
import { tablesToComponents } from "./tablesToComponents";
import { defineWorld } from "@latticexyz/world";

describe("tablesToComponents", () => {
  // Eventually, config output will truncate table names and the label will move to a `label` key.
  // This test ensures we still have components named by their labels so we don't forget to update this code path.
  it("maps table label to component name", async () => {
    const world = createWorld();
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
      },
    });

    const components = tablesToComponents(world, config.tables);
    expect(components.ExceedsResourceNameSizeLimit.metadata.componentName).toBe("ExceedsResourceNameSizeLimit");
  });
});
