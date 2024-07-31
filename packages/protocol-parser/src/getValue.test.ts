import { describe, expect, it } from "vitest";
import { getValue } from "./getValue";

describe("getValue", () => {
  it("should return the key fields of the record", () => {
    const table = {
      schema: {
        key1: { type: "uint32", internalType: "uint32" },
        key2: { type: "uint256", internalType: "uint256" },
        value1: { type: "string", internalType: "string" },
        value2: { type: "string", internalType: "string" },
      },
      key: ["key1", "key2"],
    } as const;
    const record = { key1: 1, key2: 2n, value1: "hello", value2: "world" };
    const value = getValue(table, record);

    expect(value).toMatchInlineSnapshot(`
      {
        "value1": "hello",
        "value2": "world",
      }
    `);
  });
});
