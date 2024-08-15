import { describe, beforeEach, it } from "vitest";
import { attest } from "@arktype/attest";
import { createStore } from "./createStash";
import { BoundTable } from "./actions/getTable";
import { Store } from "./common";
import { DefaultActions } from "./decorators/default";
import { defineTable } from "@latticexyz/store/config/v2";

describe("BoundTable", () => {
  const tableConfig = defineTable({
    label: "table1",
    namespace: "namespace1",
    schema: { field1: "uint32", field2: "address" },
    key: ["field1"],
  });
  let table: BoundTable<typeof tableConfig>;

  let store: Store & DefaultActions;

  beforeEach(() => {
    store = createStore();
    table = store.registerTable({ table: tableConfig });
  });

  describe("setRecord", () => {
    it("should set a record in the table", () => {
      table.setRecord({ key: { field1: 1 }, record: { field2: "0x00" } });
      attest(store.get().records).snap({ namespace1: { table1: { "1": { field1: 1, field2: "0x00" } } } });
    });

    it("should throw a type error if the key or record type doesn't match", () => {
      attest(() =>
        table.setRecord({
          key: { field1: 1 },
          // @ts-expect-error Type '"world"' is not assignable to type '`0x${string}`'
          record: { field2: "world" },
        }),
      ).type.errors("Type '\"world\"' is not assignable to type '`0x${string}`'");
    });
  });

  describe("getRecord", () => {
    it("should get a record from the table", () => {
      table.setRecord({ key: { field1: 2 }, record: { field2: "0x01" } });
      attest(table.getRecord({ key: { field1: 2 } })).snap({ field1: 2, field2: "0x01" });
    });
  });

  describe.todo("getRecords");
  describe.todo("getKeys");
});
