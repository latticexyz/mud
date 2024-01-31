import { describe, expect, it } from "vitest";
import { encodeValueArgs } from "./encodeValueArgs";
import { stringToHex } from "viem";

describe("encodeValueArgs", () => {
  it("can encode record value to hex", () => {
    const valueSchema = {
      entityId: "bytes32",
      exists: "bool",
      playerName: "string",
      badges: "uint256[]",
    } as const;

    const result = encodeValueArgs(valueSchema, {
      entityId: stringToHex("hello", { size: 32 }),
      exists: true,
      playerName: "henry",
      badges: [42n],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "dynamicData": "0x68656e7279000000000000000000000000000000000000000000000000000000000000002a",
        "encodedLengths": "0x0000000000000000000000000000000000000020000000000500000000000025",
        "staticData": "0x68656c6c6f00000000000000000000000000000000000000000000000000000001",
      }
    `);
  });

  it("encodes record when key order of value and valueSchema do not match", () => {
    const valueSchema = {
      entityId: "bytes32",
      playerName: "string",
      exists: "bool",
      badges: "uint256[]",
    } as const;

    const result = encodeValueArgs(valueSchema, {
      exists: true,
      playerName: "henry",
      entityId: stringToHex("hello", { size: 32 }),
      badges: [42n],
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "dynamicData": "0x68656e7279000000000000000000000000000000000000000000000000000000000000002a",
        "encodedLengths": "0x0000000000000000000000000000000000000020000000000500000000000025",
        "staticData": "0x68656c6c6f00000000000000000000000000000000000000000000000000000001",
      }
    `);
  });
});
