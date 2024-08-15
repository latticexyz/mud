import { defineStore } from "@latticexyz/store";
import { describe, expect, it, vi } from "vitest";
import { createStore } from "../createStore";
import { subscribeTable } from "./subscribeTable";
import { setRecord } from "./setRecord";

describe("subscribeTable", () => {
  it("should notify subscriber of table change", () => {
    const config = defineStore({
      namespaces: {
        namespace1: {
          tables: {
            table1: {
              schema: { a: "address", b: "uint256", c: "uint32" },
              key: ["a"],
            },
          },
        },
        namespace2: {
          tables: {
            table2: {
              schema: { a: "address", b: "uint256", c: "uint32" },
              key: ["a"],
            },
          },
        },
      },
    });

    const table1 = config.namespaces.namespace1.tables.table1;
    const table2 = config.namespaces.namespace2.tables.table2;
    const store = createStore(config);
    const subscriber = vi.fn();

    subscribeTable({ store, table: table1, subscriber });

    setRecord({ store, table: table1, key: { a: "0x00" }, record: { b: 1n, c: 2 } });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenNthCalledWith(1, {
      "0x00": {
        prev: undefined,
        current: { a: "0x00", b: 1n, c: 2 },
      },
    });

    // Expect unrelated updates to not notify subscribers
    setRecord({ store, table: table2, key: { a: "0x01" }, record: { b: 1n, c: 2 } });
    expect(subscriber).toHaveBeenCalledTimes(1);

    setRecord({ store, table: table1, key: { a: "0x00" }, record: { b: 1n, c: 3 } });

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenNthCalledWith(2, {
      "0x00": {
        prev: { a: "0x00", b: 1n, c: 2 },
        current: { a: "0x00", b: 1n, c: 3 },
      },
    });
  });
});
