import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStore } from "../createStore";
import { getTables } from "./getTables";
import { attest } from "@ark/attest";

describe("getTables", () => {
  it("should return bound tables for each registered table in the store", () => {
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
    const store = createStore(config);
    const tables = getTables({ store });

    attest<"namespace1" | "namespace2", keyof typeof tables>();

    attest<"table2", keyof typeof tables.namespace2>();

    attest(tables).snap({
      namespace1: {
        table1: {
          decodeKey: "Function(decodeKey)",
          deleteRecord: "Function(deleteRecord)",
          encodeKey: "Function(encodeKey)",
          getConfig: "Function(getConfig)",
          getKeys: "Function(getKeys)",
          getRecord: "Function(getRecord)",
          getRecords: "Function(getRecords)",
          setRecord: "Function(setRecord)",
          setRecords: "Function(setRecords)",
          subscribe: "Function(subscribe)",
        },
      },
      namespace2: {
        table2: {
          decodeKey: "Function(decodeKey1)",
          deleteRecord: "Function(deleteRecord1)",
          encodeKey: "Function(encodeKey1)",
          getConfig: "Function(getConfig1)",
          getKeys: "Function(getKeys1)",
          getRecord: "Function(getRecord1)",
          getRecords: "Function(getRecords1)",
          setRecord: "Function(setRecord1)",
          setRecords: "Function(setRecords1)",
          subscribe: "Function(subscribe1)",
        },
      },
    });
  });
});
