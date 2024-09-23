import { describe, expect, it } from "vitest";
import { createWorld } from "@latticexyz/recs";
import { tablesToComponents } from "./tablesToComponents";
import { defineWorld } from "@latticexyz/world";
import { resourceToHex } from "@latticexyz/common";

describe("tablesToComponents", () => {
  it("maps table label to component name", async () => {
    const world = createWorld();
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
      },
    });

    const components = tablesToComponents(world, config.tables);
    expect(components.ExceedsResourceNameSizeLimit.id).toBe(
      resourceToHex({
        type: "table",
        namespace: "app",
        name: "ExceedsResourceN",
      }),
    );
    expect(components.ExceedsResourceNameSizeLimit.metadata.componentName).toBe("ExceedsResourceNameSizeLimit");
    expect(components.ExceedsResourceNameSizeLimit.metadata.tableName).toBe("ExceedsResourceNameSizeLimit");
  });
});
