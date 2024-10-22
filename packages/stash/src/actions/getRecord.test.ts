import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { setRecord } from "./setRecord";
import { getRecord } from "./getRecord";

describe("getRecord", () => {
  it("should get a record by key from the table", () => {
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

    attest(
      getRecord({
        stash,
        table,
        key: { field2: 1, field3: 2 },
      }),
    ).snap({ field1: "hello", field2: 1, field3: 2 });

    attest<{ field1: string; field2: number; field3: number } | undefined>(
      getRecord({
        stash,
        table,
        key: { field2: 2, field3: 1 },
      }),
    ).snap({ field1: "world", field2: 2, field3: 1 });
  });

  it("should throw a type error if the key type doesn't match", () => {
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
      getRecord({
        stash,
        table,
        // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
        key: { field2: 1 },
      }),
    ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

    attest(() =>
      getRecord({
        stash,
        table,
        // @ts-expect-error Type 'string' is not assignable to type 'number'
        key: { field2: 1, field3: "invalid" },
      }),
    ).type.errors(`Type 'string' is not assignable to type 'number'`);
  });
});
