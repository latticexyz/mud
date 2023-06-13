import { describe, expect, it } from "vitest";
import { hexToPackedCounter } from "./hexToPackedCounter";

describe("hexToPackedCounter", () => {
  it("decodes hex data to packed counter", () => {
    expect(hexToPackedCounter("0x0000000000008000000000200000000020000000004000000000000000000000"))
      .toMatchInlineSnapshot(`
      {
        "fieldByteLengths": [
          32,
          32,
          64,
          0,
          0,
        ],
        "totalByteLength": 128n,
      }
    `);
  });

  it("throws if schema hex data is not bytes32", () => {
    expect(() => hexToPackedCounter("0x01234")).toThrowErrorMatchingInlineSnapshot(
      '"Hex value \\"0x01234\\" has length of 5, but expected length of 64 for a packed counter."'
    );
  });
});
