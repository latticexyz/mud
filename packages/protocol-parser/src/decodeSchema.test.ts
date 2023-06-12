import { describe, expect, it } from "vitest";
import { decodeSchema } from "./decodeSchema";

describe("decodeSchema", () => {
  it("decodes schema data to schema", () => {
    expect(decodeSchema("0x0001010060000000000000000000000000000000000000000000000000000000")).toStrictEqual({
      staticDataLength: 1,
      staticFields: ["bool"],
      dynamicFields: [],
      isEmpty: false,
      schemaData: "0x0001010060000000000000000000000000000000000000000000000000000000",
    });
    expect(decodeSchema("0x0001010160c20000000000000000000000000000000000000000000000000000")).toStrictEqual({
      staticDataLength: 1,
      staticFields: ["bool"],
      dynamicFields: ["bool[]"],
      isEmpty: false,
      schemaData: "0x0001010160c20000000000000000000000000000000000000000000000000000",
    });
    expect(decodeSchema("0x002402045f2381c3c4c500000000000000000000000000000000000000000000")).toStrictEqual({
      staticDataLength: 36,
      staticFields: ["bytes32", "int32"],
      dynamicFields: ["uint256[]", "address[]", "bytes", "string"],
      isEmpty: false,
      schemaData: "0x002402045f2381c3c4c500000000000000000000000000000000000000000000",
    });
  });
});
