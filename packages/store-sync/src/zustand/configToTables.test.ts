import { describe, expect, it } from "vitest";
import { configToTables } from "./configToTables";
import { defineWorld } from "@latticexyz/world";
import { resourceToHex } from "@latticexyz/common";

describe("configToTables", () => {
  it("flattens tables from single namespace", async () => {
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
      },
    });

    const tables = configToTables(config);
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

  // TODO: add test with multiple namespaces
  // TODO: add test where the label is the same for two tables in different namespaces to make sure TS + runtime agree on which takes precedence
});
