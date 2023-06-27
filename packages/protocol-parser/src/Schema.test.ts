import { describe, expect, it } from "vitest";
import { Schema } from "./Schema";

describe("schema", () => {
  it("should serialize to JSON", () => {
    const schema = new Schema([], []);
    expect(JSON.stringify(schema)).toMatchInlineSnapshot('"{\\"staticFields\\":[],\\"dynamicFields\\":[]}"');
  });

  it("converts schema to hex", () => {
    expect(new Schema(["bool"]).toHex()).toBe("0x0001010060000000000000000000000000000000000000000000000000000000");
    expect(new Schema(["bool"], ["bool[]"]).toHex()).toBe(
      "0x0001010160c20000000000000000000000000000000000000000000000000000"
    );
    expect(new Schema(["bytes32", "int32"], ["uint256[]", "address[]", "bytes", "string"]).toHex()).toBe(
      "0x002402045f2381c3c4c500000000000000000000000000000000000000000000"
    );
  });

  it("converts hex to schema", () => {
    expect(Schema.fromHex("0x0001010060000000000000000000000000000000000000000000000000000000")).toMatchInlineSnapshot(`
      Schema {
        "dynamicFields": [],
        "staticFields": [
          "bool",
        ],
      }
    `);
    expect(Schema.fromHex("0x0001010160c20000000000000000000000000000000000000000000000000000")).toMatchInlineSnapshot(`
      Schema {
        "dynamicFields": [
          "bool[]",
        ],
        "staticFields": [
          "bool",
        ],
      }
    `);
    expect(Schema.fromHex("0x002402045f2381c3c4c500000000000000000000000000000000000000000000")).toMatchInlineSnapshot(`
      Schema {
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
    expect(() => Schema.fromHex("0x002502045f2381c3c4c5")).toThrow(
      'Hex value "0x002502045f2381c3c4c5" has length of 20, but expected length of 64 for a schema.'
    );
  });

  it("throws if schema static field lengths do not match", () => {
    expect(() => Schema.fromHex("0x002502045f2381c3c4c500000000000000000000000000000000000000000000")).toThrow(
      'Schema "0x002502045f2381c3c4c500000000000000000000000000000000000000000000" static data length (37) did not match the summed length of all static fields (36). Is `staticAbiTypeToByteLength` up to date with Solidity schema types?'
    );
  });

  it("can encode a record values to hex", () => {
    const schema = new Schema(["uint32", "uint128"], ["uint32[]", "string"]);
    const hex = schema.encodeRecord([1, 2n, [3, 4], "some string"]);
    expect(hex).toBe(
      "0x0000000100000000000000000000000000000002000000000000130000000008000000000b0000000000000000000000000000000000000300000004736f6d6520737472696e67"
    );
  });

  it("can decode hex to record values", () => {
    const schema = new Schema(["uint32", "uint128"], ["uint32[]", "string"]);
    const values = schema.decodeRecord(
      "0x0000000100000000000000000000000000000002000000000000130000000008000000000b0000000000000000000000000000000000000300000004736f6d6520737472696e67"
    );
    expect(values).toStrictEqual([1, 2n, [3, 4], "some string"]);
  });
});
