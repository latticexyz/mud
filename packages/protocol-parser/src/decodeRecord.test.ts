import { describe, expect, it } from "vitest";
import { decodeRecord } from "./decodeRecord";

describe("decodeRecord", () => {
  it("can decode hex to record values", () => {
    const valueSchema = { staticFields: ["uint32", "uint128"], dynamicFields: ["uint32[]", "string"] } as const;
    const values = decodeRecord(
      valueSchema,
      "0x0000000100000000000000000000000000000002000000000000000000000000000000000000000b0000000008000000000000130000000300000004736f6d6520737472696e67"
    );
    expect(values).toStrictEqual([1, 2n, [3, 4], "some string"]);
  });

  it("can decode an empty record", () => {
    const valueSchema = { staticFields: [], dynamicFields: ["string", "string"] } as const;
    const values = decodeRecord(valueSchema, "0x0000000000000000000000000000000000000000000000000000000000000000");
    expect(values).toMatchInlineSnapshot(`
      [
        "",
        "",
      ]
    `);
  });

  it("can decode an out of bounds array", () => {
    const valueSchema = { staticFields: [], dynamicFields: ["uint32[]"] } as const;
    const values = decodeRecord(valueSchema, "0x0000000000000000000000000000000000000000000000000400000000000004");
    expect(values).toMatchInlineSnapshot(`
      [
        [
          0,
        ],
      ]
    `);
  });
});
