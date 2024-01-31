import { describe, expect, it } from "vitest";
import { schemaToHex } from "./schemaToHex";

describe("schemaToHex", () => {
  it("converts schema to hex", () => {
    expect(schemaToHex({ staticFields: ["bool"], dynamicFields: [] })).toBe(
      "0x0001010060000000000000000000000000000000000000000000000000000000"
    );
    expect(schemaToHex({ staticFields: ["bool"], dynamicFields: ["bool[]"] })).toBe(
      "0x0001010160c20000000000000000000000000000000000000000000000000000"
    );
    expect(
      schemaToHex({ staticFields: ["bytes32", "int32"], dynamicFields: ["uint256[]", "address[]", "bytes", "string"] })
    ).toBe("0x002402045f2381c3c4c500000000000000000000000000000000000000000000");
  });
});
