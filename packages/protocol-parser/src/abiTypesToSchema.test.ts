import { describe, expect, it } from "vitest";
import { abiTypesToSchema } from "./abiTypesToSchema";

describe("abiTypesToSchema", () => {
  it("encode a schema from ABI types", () => {
    expect(abiTypesToSchema(["bool"])).toStrictEqual({
      staticDataLength: 1,
      staticFields: ["bool"],
      dynamicFields: [],
      isEmpty: false,
      schemaData: "0x0001010060",
    });
    expect(abiTypesToSchema(["bool"], ["bool[]"])).toStrictEqual({
      staticDataLength: 1,
      staticFields: ["bool"],
      dynamicFields: ["bool[]"],
      isEmpty: false,
      schemaData: "0x0001010160c2",
    });
    expect(abiTypesToSchema(["bytes32", "int32"], ["uint256[]", "address[]", "bytes", "string"])).toStrictEqual({
      staticDataLength: 36,
      staticFields: ["bytes32", "int32"],
      dynamicFields: ["uint256[]", "address[]", "bytes", "string"],
      isEmpty: false,
      schemaData: "0x002402045f2381c3c4c5",
    });
  });
});
