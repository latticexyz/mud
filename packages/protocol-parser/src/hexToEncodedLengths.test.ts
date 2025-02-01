import { describe, expect, it } from "vitest";
import { hexToEncodedLengths } from "./hexToEncodedLengths";

describe("hexToEncodedLengths", () => {
  it("decodes hex data to encoded lengths", () => {
    expect(hexToEncodedLengths("0x0000000000000000000000000000400000000020000000002000000000000080"))
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
    expect(() => hexToEncodedLengths("0x01234")).toThrowErrorMatchingInlineSnapshot(
      '"Hex value \\"0x01234\\" has length of 5, but expected length of 64 for encoded lengths."',
    );
  });

  it("throws if encoded lengths total byte length doesn't match summed byte length of fields", () => {
    expect(() =>
      hexToEncodedLengths("0x0000000000000000000000000000400000000020000000002000000000000040"),
    ).toThrowErrorMatchingInlineSnapshot(
      // eslint-disable-next-line max-len
      '"EncodedLengths \\"0x0000000000000000000000000000400000000020000000002000000000000040\\" total bytes length (64) did not match the summed length of all field byte lengths (128)."',
    );
  });
});
