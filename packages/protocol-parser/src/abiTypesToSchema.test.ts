import { describe, expect, it } from "vitest";
import { abiTypesToSchema } from "./abiTypesToSchema";

describe("hexToSchema", () => {
  it("converts hex to schema", () => {
    expect(abiTypesToSchema(["bool"])).toMatchInlineSnapshot(`
      {
        "dynamicFields": [],
        "staticFields": [
          "bool",
        ],
      }
    `);
    expect(abiTypesToSchema(["bool", "bool[]"])).toMatchInlineSnapshot(`
      {
        "dynamicFields": [
          "bool[]",
        ],
        "staticFields": [
          "bool",
        ],
      }
    `);
    expect(abiTypesToSchema(["bytes32", "int32", "uint256[]", "address[]", "bytes", "string"])).toMatchInlineSnapshot(`
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
});
