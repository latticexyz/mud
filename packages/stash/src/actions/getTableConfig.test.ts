import { defineTable } from "@latticexyz/store/internal";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { attest } from "@ark/attest";
import { getTableConfig } from "./getTableConfig";
import { registerTable } from "./registerTable";

describe("getConfig", () => {
  it("should return the config of the given table", () => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      codegen: _1,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      deploy: _2,
      ...rootTable
    } = defineTable({
      label: "test",
      schema: { field1: "address", field2: "string" },
      key: ["field1"],
    });

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      codegen: _3,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      deploy: _4,
      ...namespacedTable
    } = defineTable({
      namespaceLabel: "namespace",
      label: "test",
      schema: { field1: "address", field2: "string" },
      key: ["field1"],
    });

    const stash = createStash();
    registerTable({ stash: stash, table: rootTable });
    registerTable({ stash: stash, table: namespacedTable });

    attest(getTableConfig({ stash: stash, table: { label: "test" } })).equals(rootTable);
    attest(getTableConfig({ stash: stash, table: { label: "test", namespaceLabel: "namespace" } })).equals(
      namespacedTable,
    );
  });
});
