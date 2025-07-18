import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/internal";
import { describe, expect, it } from "vitest";
import { createStash } from "../createStash";
import { registerDerivedTable } from "./registerDerivedTable";
import { registerTable } from "./registerTable";
import { setRecord } from "./setRecord";
import { deleteRecord } from "./deleteRecord";
import { isDefined } from "@latticexyz/common/utils";
import { getRecord } from "./getRecord";
import { PendingStashUpdate, TableUpdate } from "../common";

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

    const derivedTable = defineTable({
      label: "derivedTable",
      schema: { field1: "uint32", field2: "address" },
      key: ["field2"],
    });
    registerTable({ stash, table: derivedTable });

    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        label: "derivedTable",
        deriveUpdates: (update) => {
          return [
            // Remove the previous derived record
            update.previous && {
              table: derivedTable,
              key: { field2: update.previous.field2 },
              value: undefined,
            },
            // Add the new derived record
            update.current && {
              table: derivedTable,
              key: { field2: update.current.field2 },
              value: update.current,
            },
          ].filter(isDefined);
        },
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
    expect(stash._.derivedTables?.namespace1?.inputTable?.derivedTable).toBeDefined();
  });

  it("should compute the initial derived table", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "inputTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field1"],
    });
    registerTable({ stash, table: inputTable });
    const derivedTable = defineTable({
      label: "derivedTable",
      schema: { field1: "uint32", field2: "address" },
      key: ["field2"],
    });
    registerTable({ stash, table: derivedTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        label: "derivedTable",
        deriveUpdates: (update) => {
          return [
            // Remove the previous derived record
            update.previous && {
              table: derivedTable,
              key: { field2: update.previous.field2 },
              value: undefined,
            },
            // Add the new derived record
            update.current && {
              table: derivedTable,
              key: { field2: update.current.field2 },
              value: update.current,
            },
          ].filter(isDefined);
        },
      },
    });

    attest(stash.get().records).equals({
      namespace1: {
        inputTable: { "1": { field1: 1, field2: "0x123" } },
      },
      "": {
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
    registerTable({ stash, table: inputTable });
    const derivedTable = defineTable({
      label: "derivedTable",
      schema: { field1: "uint32", field2: "address" },
      key: ["field2"],
    });
    registerTable({ stash, table: derivedTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        label: "derivedTable",
        deriveUpdates: (update) => {
          return [
            // Remove the previous derived record
            update.previous && {
              table: derivedTable,
              key: { field2: update.previous.field2 },
              value: undefined,
            },
            // Add the new derived record
            update.current && {
              table: derivedTable,
              key: { field2: update.current.field2 },
              value: update.current,
            },
          ].filter(isDefined);
        },
      },
    });

    // After registering the derived table, the derived table should have been hydrated with the derived state
    attest(stash.get().records).equals({
      namespace1: {
        inputTable: { "1": { field1: 1, field2: "0x123" } },
      },
      "": {
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
      },
      "": {
        derivedTable: {
          "0x123": { field1: 1, field2: "0x123" },
          "0x456": { field1: 2, field2: "0x456" },
        },
      },
    });
  });

  it("should handle non-unique keys", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "inputTable",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field1"],
    });
    registerTable({ stash, table: inputTable });
    const derivedTable = defineTable({
      label: "derivedTable",
      schema: { field1: "uint32", field2: "address", index: "uint32" },
      key: ["field2", "index"],
    });
    registerTable({ stash, table: derivedTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
    setRecord({ stash, table: inputTable, key: { field1: 2 }, value: { field2: "0x123" } });

    registerDerivedTable({
      stash,
      derivedTable: {
        input: inputTable,
        label: "derivedTable",
        deriveUpdates: (() => {
          let count = 0;
          return ({ previous, current }: TableUpdate<typeof inputTable>) => {
            // Remove the previous derived record
            const updates: PendingStashUpdate[] = [];
            if (previous) {
              // Find the previous derived record
              for (let i = 0; i < count; i++) {
                const previousDerivedRecord = getRecord({
                  stash,
                  table: derivedTable,
                  key: { field2: previous.field2, index: i },
                });
                if (previousDerivedRecord?.field1 === previous.field1) {
                  // Remove the previous derived record
                  updates.push({
                    table: derivedTable,
                    key: { field2: previous.field2, index: i },
                    value: undefined,
                  });
                  if (i < count - 1) {
                    // Update the index of the last derived record if it exists
                    const lastDerivedRecord = getRecord({
                      stash,
                      table: derivedTable,
                      key: { field2: previous.field2, index: count - 1 },
                    });
                    updates.push({
                      table: derivedTable,
                      key: { field2: previous.field2, index: count - 1 },
                      value: undefined,
                    });
                    updates.push({
                      table: derivedTable,
                      key: { field2: previous.field2, index: i },
                      value: { ...lastDerivedRecord, index: i },
                    });
                  }
                  count--;
                  break;
                }
              }
            }
            // Add the new derived record
            if (current) {
              updates.push({
                table: derivedTable,
                key: { field2: current.field2, index: count },
                value: { ...current, index: count },
              });
              count++;
            }

            return updates;
          };
        })(),
      },
    });

    attest(stash.get().records[""]?.derivedTable).equals({
      "0x123|0": { field1: 1, field2: "0x123", index: 0 },
      "0x123|1": { field1: 2, field2: "0x123", index: 1 },
    });

    deleteRecord({ stash, table: inputTable, key: { field1: 2 } });
    attest(stash.get().records[""]?.derivedTable).equals({
      "0x123|0": { field1: 1, field2: "0x123", index: 0 },
    });
  });
});
