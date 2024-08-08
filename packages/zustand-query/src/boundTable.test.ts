import { describe, beforeEach, it } from "vitest";
import { attest } from "@arktype/attest";
import { createStore } from "./createStore";
import { BoundTable } from "./actions/getTable";
import { Store } from "./common";
import { DefaultActions } from "./decorators/default";

describe("BoundTable", () => {
  let table: BoundTable;
  let store: Store & DefaultActions;

  beforeEach(() => {
    store = createStore();
    table = store.registerTable({
      table: {
        label: "table1",
        namespace: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      },
    });
  });

  describe("setRecord", () => {
    it("should set a record in the table", () => {
      table.setRecord({ key: { field1: 1 }, record: { field2: "0x00" } });
      attest(store.get().records).snap({ namespace1: { table1: { "1": { field1: 1, field2: "0x00" } } } });
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
