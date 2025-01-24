import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { attest } from "@ark/attest";
import { setRecord } from "./setRecord";

describe("setRecord", () => {
  it("should add the record to the table", () => {
    const config = defineStore({
      namespace: "namespace1",
      tables: {
        table1: {
          schema: {
            field1: "string",
            field2: "uint32",
            field3: "int32",
          },
          key: ["field2", "field3"],
        },
      },
    });

    const table = config.namespaces.namespace1.tables.table1;
    const stash = createStash(config);

    setRecord({
      stash,
      table,
      key: { field2: 1, field3: 2 },
      value: { field1: "hello" },
    });

    setRecord({
      stash,
      table,
      key: { field2: 2, field3: 1 },
      value: { field1: "world" },
    });

    attest(stash.get().records).snap({
      namespace1: {
        table1: {
          "1|2": { field1: "hello", field2: 1, field3: 2 },
          "2|1": { field1: "world", field2: 2, field3: 1 },
        },
      },
    });
  });

  it("should show a type warning if an invalid table, key or record is used", () => {
    const config = defineStore({
      namespace: "namespace1",
      tables: {
        table1: {
          schema: {
            field1: "string",
            field2: "uint32",
            field3: "int32",
          },
          key: ["field2", "field3"],
        },
      },
    });

    const table = config.namespaces.namespace1.tables.table1;
    const stash = createStash(config);

    attest(() =>
      setRecord({
        stash,
        table,
        // @ts-expect-error Property 'field2' is missing in type '{ field3: number; }'
        key: { field3: 2 },
        value: { field1: "" },
      }),
    )
      .throws("Provided key is missing field field2.")
      .type.errors(`Property 'field2' is missing in type '{ field3: number; }`);

    attest(() =>
      setRecord({
        stash,
        table,
        // @ts-expect-error Type 'string' is not assignable to type 'number'.
        key: { field2: 1, field3: "invalid" },
        value: { field1: "" },
      }),
    ).type.errors(`Type 'string' is not assignable to type 'number'.`);

    attest(() =>
      setRecord({
        stash,
        table,
        key: { field2: 1, field3: 2 },
        // @ts-expect-error Type 'number' is not assignable to type 'string'.
        value: { field1: 1 },
      }),
    ).type.errors(`Type 'number' is not assignable to type 'string'.`);
  });
});
