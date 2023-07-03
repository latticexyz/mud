import { describe, expect, it } from "vitest";
import { encodeRecord } from "./encodeRecord";

describe("encodeRecord", () => {
  it("can encode a schema and record values to hex", () => {
    const schema = { staticFields: ["uint32", "uint128"], dynamicFields: ["uint32[]", "string"] } as const;
    const hex = encodeRecord(schema, [1, 2n, [3, 4], "some string"]);
    expect(hex).toBe(
      "0x0000000100000000000000000000000000000002000000000000130000000008000000000b0000000000000000000000000000000000000300000004736f6d6520737472696e67"
    );
  });

  it("should not include the packed dynamic lengths if there are no dynamic fields", () => {
    const schema = { staticFields: ["uint32", "uint128"], dynamicFields: [] } as const;
    const hex = encodeRecord(schema, [1, 2n]);
    expect(hex).toBe("0x0000000100000000000000000000000000000002");
  });
});
