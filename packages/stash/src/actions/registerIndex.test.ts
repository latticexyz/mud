import { attest } from "@ark/attest";
import { defineTable } from "@latticexyz/store/internal";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { registerTable } from "./registerTable";
import { registerIndex } from "./registerIndex";

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
  });
});
