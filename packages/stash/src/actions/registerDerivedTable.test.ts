import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/internal";
import { describe, expect, it } from "vitest";
import { createStash } from "../createStash";
import { registerDerivedTable } from "./registerDerivedTable";
import { registerTable } from "./registerTable";
import { setRecord } from "./setRecord";

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
    expect(stash._.derivedTables?.namespace1?.inputTable?.__derivedTable).toBeDefined();
  });

  it("should compute the initial derived table", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "inputTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field1"],
    });
    const derivedTable = defineTable({
      label: "derivedTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field2"],
    });
    registerTable({ stash, table: inputTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        output: derivedTable,
        getKey: ({ field2 }) => ({ field2 }),
      },
    });

    attest(stash.get().records).snap({
      namespace1: {
        inputTable: { "1": { field1: 1, field2: "0x123" } },
        derivedTable: { "0x123": { field1: 1, field2: "0x123" } },
      },
    });
  });

  it("should update the derived table when the input table is updated", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "inputTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field1"],
    });
    const derivedTable = defineTable({
      label: "derivedTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field2"],
    });
    registerTable({ stash, table: inputTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        output: derivedTable,
        getKey: ({ field2 }) => ({ field2 }),
      },
    });

    // After registering the derived table, the derived table should have been hydrated with the derived state
    attest(stash.get().records).equals({
      namespace1: {
        inputTable: { "1": { field1: 1, field2: "0x123" } },
        derivedTable: { "0x123": { field1: 1, field2: "0x123" } },
      },
    });

    // Setting a new record on the source table should update the derived table
    setRecord({ stash, table: inputTable, key: { field1: 2 }, value: { field2: "0x456" } });
    attest(stash.get().records).equals({
      namespace1: {
        inputTable: {
          "1": { field1: 1, field2: "0x123" },
          "2": { field1: 2, field2: "0x456" },
        },
        derivedTable: {
          "0x123": { field1: 1, field2: "0x123" },
          "0x456": { field1: 2, field2: "0x456" },
        },
      },
    });
  });
});
