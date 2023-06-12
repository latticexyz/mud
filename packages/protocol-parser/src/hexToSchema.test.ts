import { describe, expect, it } from "vitest";
import { hexToSchema } from "./hexToSchema";

describe("hexToSchema", () => {
  it("decodes schema hex data to schema", () => {
    expect(hexToSchema("0x0001010060000000000000000000000000000000000000000000000000000000")).toStrictEqual({
      staticDataLength: 1,
      staticFields: ["bool"],
      dynamicFields: [],
      isEmpty: false,
      schemaData: "0x0001010060000000000000000000000000000000000000000000000000000000",
    });
    expect(hexToSchema("0x0001010160c20000000000000000000000000000000000000000000000000000")).toStrictEqual({
      staticDataLength: 1,
      staticFields: ["bool"],
      dynamicFields: ["bool[]"],
      isEmpty: false,
      schemaData: "0x0001010160c20000000000000000000000000000000000000000000000000000",
    });
    expect(hexToSchema("0x002402045f2381c3c4c500000000000000000000000000000000000000000000")).toStrictEqual({
      staticDataLength: 36,
      staticFields: ["bytes32", "int32"],
      dynamicFields: ["uint256[]", "address[]", "bytes", "string"],
      isEmpty: false,
      schemaData: "0x002402045f2381c3c4c500000000000000000000000000000000000000000000",
    });
  });
});
