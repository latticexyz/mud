import { attest } from "@ark/attest";
import { describe, it } from "vitest";
import { encodeKey } from "./encodeKey";
import { defineTable } from "@latticexyz/store/config/v2";

describe("encodeKey", () => {
  it("should encode a key to a string", () => {
    const table = defineTable({
      label: "test",
      schema: { field1: "uint32", field2: "uint256", field3: "string" },
      key: ["field1", "field2"],
    });
    attest(encodeKey({ table, key: { field1: 1, field2: 2n } })).snap("1|2");
  });

  it("should throw a type error if an invalid key is provided", () => {
    const table = defineTable({
      label: "test",
      schema: { field1: "uint32", field2: "uint256", field3: "string" },
      key: ["field1", "field2"],
    });

    attest(() =>
      encodeKey({
        table,
        // @ts-expect-error Property 'field2' is missing in type '{ field1: number; }'
        key: {
          field1: 1,
        },
      }),
    )
      .throws(`Provided key is missing field field2.`)
      .type.errors(`Property 'field2' is missing in type '{ field1: number; }'`);

    attest(
      encodeKey({
        table,
        key: {
          field1: 1,
          // @ts-expect-error Type 'string' is not assignable to type 'bigint'.
          field2: "invalid",
        },
      }),
    ).type.errors(`Type 'string' is not assignable to type 'bigint'.`);
  });
});
