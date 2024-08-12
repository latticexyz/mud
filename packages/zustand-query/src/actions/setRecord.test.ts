import { defineStore } from "@latticexyz/store/config/v2";
import { describe, it } from "vitest";
import { createStore } from "../createStore";
import { attest } from "@ark/attest";
import { setRecord } from "./setRecord";

describe("setRecord", () => {
  it("should add the record to the table", () => {
    const tablesConfig = defineStore({
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

    const store = createStore(tablesConfig);
    setRecord({
      store,
      table: { label: "table1", namespace: "namespace1" },
      key: { field2: 1, field3: 2 },
      record: { field1: "hello" },
    });

    setRecord({
      store,
      table: { label: "table1", namespace: "namespace1" },
      key: { field2: 2, field3: 1 },
      record: { field1: "world" },
    });

    attest(store.get().records).snap({
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

    const store = createStore(config);

    attest(() =>
      setRecord({
        store,
        // @ts-expect-error Type '"invalid"' is not assignable to type '"namespace1"'.
        table: { namespace: "invalid", label: "table1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "" },
      }),
    )
      .throws("Table 'invalid__table1' is not registered yet.")
      .type.errors(`Type '"invalid"' is not assignable to type '"namespace1"'.`);

    attest(() =>
      setRecord({
        store,
        // @ts-expect-error Type '"invalid"' is not assignable to type '"table1"'.
        table: { namespace: "namespace1", label: "invalid" },
        key: { field2: 1, field3: 2 },
        record: { field1: "" },
      }),
    )
      .throws("Table 'namespace1__invalid' is not registered yet.")
      .type.errors(`Type '"invalid"' is not assignable to type '"table1"'.`);

    attest(() =>
      setRecord({
        store,
        table: { namespace: "namespace1", label: "table1" },
        // @ts-expect-error Property 'field2' is missing in type '{ field3: number; }'
        key: { field3: 2 },
        record: { field1: "" },
      }),
    )
      .throws("Provided key is missing field field2.")
      .type.errors(`Property 'field2' is missing in type '{ field3: number; }`);

    attest(() =>
      setRecord({
        store,
        table: { namespace: "namespace1", label: "table1" },
        // @ts-expect-error Type 'string' is not assignable to type 'number'.
        key: { field2: 1, field3: "invalid" },
        record: { field1: "" },
      }),
    ).type.errors(`Type 'string' is not assignable to type 'number'.`);

    attest(() =>
      setRecord({
        store,
        table: { namespace: "namespace1", label: "table1" },
        key: { field2: 1, field3: 2 },
        // @ts-expect-error Type 'number' is not assignable to type 'string'.
        record: { field1: 1 },
      }),
    ).type.errors(`Type 'number' is not assignable to type 'string'.`);
  });
});
