import { describe, expect, it } from "vitest";
import { encodeTestData } from "./encodeTestData";

describe("encodeTestData", () => {
  it("should encode numbers", () => {
    expect(encodeTestData({ Number: [{ key: { key: 42 }, value: { value: 1337 } }] })).toStrictEqual({
      Number: [{ key: ["0x000000000000000000000000000000000000000000000000000000000000002a"], value: "0x00000539" }],
    });

    expect(encodeTestData({ Vector: [{ key: { key: 1337 }, value: { x: 42, y: -69 } }] })).toStrictEqual({
      Vector: [
        { key: ["0x0000000000000000000000000000000000000000000000000000000000000539"], value: "0x0000002affffffbb" },
      ],
    });
  });

  it("should encode number arrays", () => {
    expect(encodeTestData({ NumberList: [{ key: {}, value: { value: [1, 2, 3] } }] })).toStrictEqual({
      NumberList: [
        {
          key: [],
          value: "0x0000000000000c000000000c0000000000000000000000000000000000000000000000010000000200000003",
        },
      ],
    });
  });
});
