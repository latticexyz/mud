import { describe, expect, it } from "vitest";
import { abiTypesToSchemaData } from "./abiTypesToSchemaData";

describe("abiTypesToSchemaData", () => {
  it("encodes schema data from ABI types", () => {
    expect(abiTypesToSchemaData(["bool"])).toBe("0x0001010060000000000000000000000000000000000000000000000000000000");
    expect(abiTypesToSchemaData(["bool"], ["bool[]"])).toBe(
      "0x0001010160c20000000000000000000000000000000000000000000000000000"
    );
    expect(abiTypesToSchemaData(["bytes32", "int32"], ["uint256[]", "address[]", "bytes", "string"])).toBe(
      "0x002402045f2381c3c4c500000000000000000000000000000000000000000000"
    );
  });
});
