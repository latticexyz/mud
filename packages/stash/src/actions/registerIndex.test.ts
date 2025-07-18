import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/internal";
import { describe, expect, it } from "vitest";
import { createStash } from "../createStash";
import { registerTable } from "./registerTable";
import { registerIndex } from "./registerIndex";
import { setRecord } from "./setRecord";
import { getRecord } from "./getRecord";
import { deleteRecord } from "./deleteRecord";

describe("registerIndex", () => {
  it("should add a new index to the stash", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "input",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address", field3: "bytes" },
      key: ["field1"],
    });

    registerTable({ stash, table: inputTable });

    const indexTable = registerIndex({ stash, table: inputTable, key: ["field2", "field3"] });
    attest<"input__field2_field3">(indexTable.label).equals("input__field2_field3");
    attest<"input__field2_field3">(indexTable.name).equals("input__field2_field3");
    attest<"__stash_index">(indexTable.namespace).equals("__stash_index");
    attest<"__stash_index">(indexTable.namespaceLabel).equals("__stash_index");
    attest<["field2", "field3", "index"]>(indexTable.key).equals(["field2", "field3", "index"]);
    attest<(typeof inputTable)["schema"] & { index: { type: "uint32"; internalType: "uint32" } }>(
      indexTable.schema,
    ).equals({
      ...inputTable.schema,
      index: { type: "uint32", internalType: "uint32" },
    });

    attest(stash.get().config).equals({
      namespace1: {
        input: {
          namespace: "namespace1",
          namespaceLabel: "namespace1",
          name: "input",
          label: "input",
          key: ["field1"],
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
            field3: { type: "bytes", internalType: "bytes" },
          },
          type: "table",
          tableId: "0x74626e616d6573706163653100000000696e7075740000000000000000000000",
        },
      },
      __stash_index: {
        input__field2_field3: {
          namespace: "__stash_index",
          namespaceLabel: "__stash_index",
          name: "input__field2_field3",
          label: "input__field2_field3",
          key: ["field2", "field3", "index"],
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
            field3: { type: "bytes", internalType: "bytes" },
            index: { type: "uint32", internalType: "uint32" },
          },
          type: "offchainTable",
          tableId: "0x6f745f5f73746173685f696e64657800696e7075745f5f6669656c64325f6669",
        },
      },
    });
    attest(stash.get().records).equals({ namespace1: { input: {} }, __stash_index: { input__field2_field3: {} } });
    expect(stash._.derivedTables?.namespace1?.input?.__stash_index__input__field2_field3).toBeDefined();
  });

  it("should compute the initial index", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "input",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address", field3: "string" },
      key: ["field1"],
    });

    registerTable({ stash, table: inputTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123", field3: "hello" } });
    registerIndex({ stash, table: inputTable, key: ["field2", "field3"] });

    attest(stash.get().records).equals({
      namespace1: {
        input: { "1": { field1: 1, field2: "0x123", field3: "hello" } },
      },
      __stash_index: {
        input__field2_field3: {
          "0x123|hello|0": { field1: 1, field2: "0x123", field3: "hello", index: 0 },
        },
      },
    });
  });

  it("should update the index when the input table is updated", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "input",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address", field3: "string" },
      key: ["field1"],
    });

    registerTable({ stash, table: inputTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123", field3: "hello" } });
    registerIndex({ stash, table: inputTable, key: ["field2", "field3"] });

    attest(stash.get().records).equals({
      namespace1: {
        input: { "1": { field1: 1, field2: "0x123", field3: "hello" } },
      },
      __stash_index: {
        input__field2_field3: {
          "0x123|hello|0": { field1: 1, field2: "0x123", field3: "hello", index: 0 },
        },
      },
    });

    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123", field3: "world" } });
    attest(stash.get().records).equals({
      namespace1: {
        input: { "1": { field1: 1, field2: "0x123", field3: "world" } },
      },
      __stash_index: {
        input__field2_field3: { "0x123|world|0": { field1: 1, field2: "0x123", field3: "world", index: 0 } },
      },
    });

    setRecord({ stash, table: inputTable, key: { field1: 0 }, value: { field2: "0x456", field3: "hello" } });
    attest(stash.get().records).equals({
      namespace1: {
        input: {
          "1": { field1: 1, field2: "0x123", field3: "world" },
          "0": { field1: 0, field2: "0x456", field3: "hello" },
        },
      },
      __stash_index: {
        input__field2_field3: {
          "0x123|world|0": { field1: 1, field2: "0x123", field3: "world", index: 0 },
          "0x456|hello|0": { field1: 0, field2: "0x456", field3: "hello", index: 0 },
        },
      },
    });
  });

  it("should return a table that's compatible with stash getRecord", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "input",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address", field3: "string" },
      key: ["field1"],
    });

    registerTable({ stash, table: inputTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123", field3: "hello" } });
    const indexTable = registerIndex({ stash, table: inputTable, key: ["field2", "field3"] });

    const indexedRecord = getRecord({
      stash,
      table: indexTable,
      key: { field2: "0x123", field3: "hello", index: 0 },
    });

    attest(indexedRecord).equals({ field1: 1, field2: "0x123", field3: "hello", index: 0 });
  });

  it("should handle non-unique keys", () => {
    const stash = createStash();
    const inputTable = defineTable({
      label: "input",
      namespaceLabel: "namespace1",
      schema: { field1: "uint32", field2: "address", field3: "string" },
      key: ["field1"],
    });

    registerTable({ stash, table: inputTable });
    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123", field3: "hello" } });

    registerIndex({ stash, table: inputTable, key: ["field2"] });

    attest(stash.get().records.__stash_index?.input__field2).equals({
      "0x123|0": { field1: 1, field2: "0x123", field3: "hello", index: 0 },
    });

    setRecord({ stash, table: inputTable, key: { field1: 2 }, value: { field2: "0x123", field3: "world" } });

    attest(stash.get().records.__stash_index?.input__field2).equals({
      "0x123|0": { field1: 1, field2: "0x123", field3: "hello", index: 0 },
      "0x123|1": { field1: 2, field2: "0x123", field3: "world", index: 1 },
    });

    deleteRecord({ stash, table: inputTable, key: { field1: 1 } });

    attest(stash.get().records.__stash_index?.input__field2).equals({
      "0x123|0": { field1: 2, field2: "0x123", field3: "world", index: 0 },
    });
  });
});
