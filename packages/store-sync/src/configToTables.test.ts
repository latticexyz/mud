import { describe, it } from "vitest";
import { configToTables } from "./configToTables";
import { defineWorld } from "@latticexyz/world";
import { resourceToHex } from "@latticexyz/common";
import { attest } from "@ark/attest";

describe("configToTables", () => {
  it("flattens tables from single namespace", async () => {
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
        Table2: "address",
      },
    });

    const tables = configToTables(config);

    attest<"ExceedsResourceNameSizeLimit" | "Table2", keyof typeof tables>();

    attest(tables.ExceedsResourceNameSizeLimit.tableId).equals(
      resourceToHex({
        type: "table",
        namespace: "app",
        name: "ExceedsResourceN",
      }),
    );
    attest(tables.ExceedsResourceNameSizeLimit.label).equals("ExceedsResourceNameSizeLimit");
    attest(tables.ExceedsResourceNameSizeLimit.name).equals("ExceedsResourceN");

    attest(tables.Table2.tableId).equals(
      resourceToHex({
        type: "table",
        namespace: "app",
        name: "Table2",
      }),
    );
    attest(tables.Table2.label).equals("Table2");
    attest(tables.Table2.name).equals("Table2");
  });

  // TODO: add test with multiple namespaces
  // TODO: add test where the label is the same for two tables in different namespaces to make sure TS + runtime agree on which takes precedence
});
