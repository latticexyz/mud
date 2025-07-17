import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/internal";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { registerDerivedTable } from "./registerDerivedTable";
import { registerTable } from "./registerTable";

describe("registerDerivedTable", () => {
  it("should add a new derived table to the stash", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "inputTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field1"],
    });

    registerTable({ stash, table: inputTable });

    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        output: defineTable({
          label: "derivedTable",
          schema: { field1: "uint32", field2: "address" },
          key: ["field2"],
        }),
        getKey: ({ field2 }) => ({ field2 }),
      },
    });

    attest(stash.get().config).snap({
      namespace1: {
        inputTable: {
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "inputTable",
          label: "inputTable",
          key: ["field1"],
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
          },
          type: "table",
          tableId: "0x74626e616d6573706163653100000000696e7075745461626c65000000000000",
        },
      },
      "": {
        derivedTable: {
          namespace: "",
          namespaceLabel: "",
          name: "derivedTable",
          label: "derivedTable",
          key: ["field2"],
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
          },
          type: "table",
          tableId: "0x74620000000000000000000000000000646572697665645461626c6500000000",
        },
      },
    });
    attest(stash.get().records).snap({ namespace1: { inputTable: {} }, "": { derivedTable: {} } });

    // TODO: check that it was added to derived tables map
  });

  it.todo("should update the derived table when the input table is updated");
});
