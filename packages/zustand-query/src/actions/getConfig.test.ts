import { defineTable } from "@latticexyz/store/config/v2";
import { describe, it } from "vitest";
import { createStore } from "../createStore";
import { attest } from "@ark/attest";
import { getConfig } from "./getConfig";
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
      namespace: "namespace",
      label: "test",
      schema: { field1: "address", field2: "string" },
      key: ["field1"],
    });

    const store = createStore();
    registerTable({ store, table: rootTable });
    registerTable({ store, table: namespacedTable });

    attest(getConfig({ store, table: { label: "test" } })).equals(rootTable);
    attest(getConfig({ store, table: { label: "test", namespace: "namespace" } })).equals(namespacedTable);
  });
});
