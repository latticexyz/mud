import { describe, beforeEach, it } from "vitest";
import { attest } from "@arktype/attest";
import { BoundTable, Store, createStore } from "./createStore";

describe("BoundTable", () => {
  let table: BoundTable;
  let store: Store;

  beforeEach(() => {
    store = createStore({});
    table = store.getState().actions.registerTable({
      label: "table1",
      namespace: "namespace1",
      schema: { field1: "uint32", field2: "address" },
      key: ["field1"],
    });
  });

  describe("setRecord", () => {
    it("should set a record in the table", () => {
      table.setRecord({ key: { field1: 1 }, record: { field2: "0x00" } });
      attest(store.getState().records).snap({ namespace1: { table1: { "1": { field1: 1, field2: "0x00" } } } });
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
