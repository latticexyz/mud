import { describe, expect, it } from "vitest";
import { tablesByLabel } from "./tablesByLabel";
import { defineWorld } from "@latticexyz/world";
import { resourceToHex } from "@latticexyz/common";

describe("tablesByLabel", () => {
  it("maps table label to component name", async () => {
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
      },
    });

    const tables = tablesByLabel(config.tables);
    expect(tables.ExceedsResourceNameSizeLimit.tableId).toBe(
      resourceToHex({
        type: "table",
        namespace: "app",
        name: "ExceedsResourceN",
      }),
    );
    expect(tables.ExceedsResourceNameSizeLimit.label).toBe("ExceedsResourceNameSizeLimit");
    expect(tables.ExceedsResourceNameSizeLimit.name).toBe("ExceedsResourceN");
  });
});
