import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/internal";
import { describe, expect, it } from "vitest";
import { createStash } from "../createStash";
import { registerTable } from "./registerTable";
import { registerIndex } from "./registerIndex";
import { setRecord } from "./setRecord";

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
    attest<["field2", "field3"]>(indexTable.key).equals(["field2", "field3"]);
    attest<(typeof inputTable)["schema"]>(indexTable.schema).equals(inputTable.schema);

    attest(stash.get().config).snap({
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
          key: ["field2", "field3"],
          schema: {
            field1: { type: "uint32", internalType: "uint32" },
            field2: { type: "address", internalType: "address" },
            field3: { type: "bytes", internalType: "bytes" },
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
          "0x123|hello": { field1: 1, field2: "0x123", field3: "hello" },
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
          "0x123|hello": { field1: 1, field2: "0x123", field3: "hello" },
        },
      },
    });

    setRecord({ stash, table: inputTable, key: { field1: 1 }, value: { field2: "0x123", field3: "world" } });
    attest(stash.get().records).equals({
      namespace1: {
        input: { "1": { field1: 1, field2: "0x123", field3: "world" } },
      },
      __stash_index: {
        input__field2_field3: { "0x123|world": { field1: 1, field2: "0x123", field3: "world" } },
      },
    });
  });
});
