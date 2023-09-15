import { describe, expect, it } from "vitest";
import { encodeRecord } from "./encodeRecord";

describe("encodeRecord", () => {
  it("can encode a value schema and record values to hex", () => {
    const valueSchema = { staticFields: ["uint32", "uint128"], dynamicFields: ["uint32[]", "string"] } as const;
    const hex = encodeRecord(valueSchema, [1, 2n, [3, 4], "some string"]);
    expect(hex).toBe(
      "0x0000000100000000000000000000000000000002000000000000000000000000000000000000000b0000000008000000000000130000000300000004736f6d6520737472696e67"
    );
  });

  it("should not include the packed dynamic lengths if there are no dynamic fields", () => {
    const valueSchema = { staticFields: ["uint32", "uint128"], dynamicFields: [] } as const;
    const hex = encodeRecord(valueSchema, [1, 2n]);
    expect(hex).toBe("0x0000000100000000000000000000000000000002");
  });

  it("can encode an array to hex", () => {
    const valueSchema = { staticFields: [], dynamicFields: ["uint32[]"] } as const;
    const hex = encodeRecord(valueSchema, [[42]]);
    expect(hex).toBe("0x00000000000000000000000000000000000000000000000004000000000000040000002a");
  });
});
