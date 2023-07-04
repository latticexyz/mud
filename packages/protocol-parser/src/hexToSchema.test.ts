import { describe, expect, it } from "vitest";
import { hexToSchema } from "./hexToSchema";

describe("hexToSchema", () => {
  it("converts hex to schema", () => {
    expect(hexToSchema("0x0001010060000000000000000000000000000000000000000000000000000000")).toMatchInlineSnapshot(`
      {
        "dynamicFields": [],
        "staticFields": [
          "bool",
        ],
      }
    `);
    expect(hexToSchema("0x0001010160c20000000000000000000000000000000000000000000000000000")).toMatchInlineSnapshot(`
      {
        "dynamicFields": [
          "bool[]",
        ],
        "staticFields": [
          "bool",
        ],
      }
    `);
    expect(hexToSchema("0x002402045f2381c3c4c500000000000000000000000000000000000000000000")).toMatchInlineSnapshot(`
      {
        "dynamicFields": [
          "uint256[]",
          "address[]",
          "bytes",
          "string",
        ],
        "staticFields": [
          "bytes32",
          "int32",
        ],
      }
    `);
  });

  it("throws if schema hex data is not bytes32", () => {
    expect(() => hexToSchema("0x002502045f2381c3c4c5")).toThrow(
      'Hex value "0x002502045f2381c3c4c5" has length of 20, but expected length of 64 for a schema.'
    );
  });

  it("throws if schema static field lengths do not match", () => {
    expect(() => hexToSchema("0x002502045f2381c3c4c500000000000000000000000000000000000000000000")).toThrow(
      'Schema "0x002502045f2381c3c4c500000000000000000000000000000000000000000000" static data length (37) did not match the summed length of all static fields (36). Is `staticAbiTypeToByteLength` up to date with Solidity schema types?'
    );
  });
});
