import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/config/v2";
import { describe, it, expect } from "vitest";
import { createStash } from "../createStash";
import { registerTable } from "./registerTable";

describe("registerTable", () => {
  it("should add a new table to the stash and return a bound table", () => {
    const stash = createStash();
    const table = registerTable({
      stash: stash,
      table: defineTable({
        label: "table1",
        namespace: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      }),
    });

    attest(stash.get().config).snap({
      namespace1: {
        table1: {
          label: "table1",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "table1",
          tableId: "0x74626e616d65737061636531000000007461626c653100000000000000000000",
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
          },
          key: ["field1"],
        },
      },
    });

    attest(stash.get().records).snap({ namespace1: { table1: {} } });
    expect(table.setRecord).toBeDefined();
    expect(table.getRecord).toBeDefined();
  });
});
