import { describe, expect, it } from "vitest";
import { encodeTestData } from "./encodeTestData";

describe("encodeTestData", () => {
  it("should encode numbers", () => {
    expect(encodeTestData({ Number: [{ key: { key: 42 }, value: { value: 1337 } }] })).toMatchInlineSnapshot(`
      {
        "Number": [
          {
            "dynamicData": "0x",
            "encodedLengths": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "fieldLayout": "0x0004010004000000000000000000000000000000000000000000000000000000",
            "key": [
              "0x000000000000000000000000000000000000000000000000000000000000002a",
            ],
            "staticData": "0x00000539",
          },
        ],
      }
    `);

    expect(encodeTestData({ Vector: [{ key: { key: 1337 }, value: { x: 42, y: -69 } }] })).toMatchInlineSnapshot(`
      {
        "Vector": [
          {
            "dynamicData": "0x",
            "encodedLengths": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "fieldLayout": "0x0008020004040000000000000000000000000000000000000000000000000000",
            "key": [
              "0x0000000000000000000000000000000000000000000000000000000000000539",
            ],
            "staticData": "0x0000002affffffbb",
          },
        ],
      }
    `);
  });
});
