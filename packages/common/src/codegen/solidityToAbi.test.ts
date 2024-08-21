/* eslint-disable max-len */
import { describe, expect, it } from "vitest";
import { formatAbi } from "abitype";
import { solidityToAbi } from "./solidityToAbi";

const visibility = ["public", "external", "private", "internal"] as const;
const mutability = [null, "view", "pure", "payable", "nonpayable"] as const;

const types = {
  uint256: "uint256",
  uint: "uint",
  string: "string",
  uintArray: "uint[]",
  stringArray: "string[]",
  keyTuples: "bytes32[][]",
  fixedArray: "bool[2]",
  mixedArray: "bool[2][]",
  deepArray: "bool[][2][4][8][]",
} as const;

describe("solidityToAbi", () => {
  it("parses error params", () => {
    const errors = [
      "error noParam();",
      ...Object.entries(types).map(([name, type]) => `error param_${name}(${type} value);`),
      `error allParams(${Object.entries(types)
        .map(([name, type]) => `${type} _${name}`)
        .join(", ")});`,
    ];
    const source = `contract MyContract {\n  ${errors.join("\n  ")}\n}`;

    expect(source).toMatchInlineSnapshot(`
      "contract MyContract {
        error noParam();
        error param_uint256(uint256 value);
        error param_uint(uint value);
        error param_string(string value);
        error param_uintArray(uint[] value);
        error param_stringArray(string[] value);
        error param_keyTuples(bytes32[][] value);
        error param_fixedArray(bool[2] value);
        error param_mixedArray(bool[2][] value);
        error param_deepArray(bool[][2][4][8][] value);
        error allParams(uint256 _uint256, uint _uint, string _string, uint[] _uintArray, string[] _stringArray, bytes32[][] _keyTuples, bool[2] _fixedArray, bool[2][] _mixedArray, bool[][2][4][8][] _deepArray);
      }"
    `);

    expect(
      formatAbi(solidityToAbi({ sourcePath: "test/Test.sol", source, contractName: "MyContract" })),
    ).toMatchInlineSnapshot(
      `
      [
        "error noParam()",
        "error param_uint256(uint256 value)",
        "error param_uint(uint value)",
        "error param_string(string value)",
        "error param_uintArray(uint[] value)",
        "error param_stringArray(string[] value)",
        "error param_keyTuples(bytes32[][] value)",
        "error param_fixedArray(bool[2] value)",
        "error param_mixedArray(bool[2][] value)",
        "error param_deepArray(bool[][2][4][8][] value)",
        "error allParams(uint256 _uint256, uint _uint, string _string, uint[] _uintArray, string[] _stringArray, bytes32[][] _keyTuples, bool[2] _fixedArray, bool[2][] _mixedArray, bool[][2][4][8][] _deepArray)",
      ]
    `,
    );
  });

  it("parses public/external functions", () => {
    const modifiers = visibility.flatMap((vis) => mutability.map((mut) => [vis, mut] as const));

    const functions = modifiers.map(([vis, mut]) => `function modifier_${vis}_${mut}() ${vis} ${mut ?? ""} {}`);
    const source = `contract MyContract {\n  ${functions.join("\n  ")}\n}`;

    expect(source).toMatchInlineSnapshot(`
      "contract MyContract {
        function modifier_public_null() public  {}
        function modifier_public_view() public view {}
        function modifier_public_pure() public pure {}
        function modifier_public_payable() public payable {}
        function modifier_public_nonpayable() public nonpayable {}
        function modifier_external_null() external  {}
        function modifier_external_view() external view {}
        function modifier_external_pure() external pure {}
        function modifier_external_payable() external payable {}
        function modifier_external_nonpayable() external nonpayable {}
        function modifier_private_null() private  {}
        function modifier_private_view() private view {}
        function modifier_private_pure() private pure {}
        function modifier_private_payable() private payable {}
        function modifier_private_nonpayable() private nonpayable {}
        function modifier_internal_null() internal  {}
        function modifier_internal_view() internal view {}
        function modifier_internal_pure() internal pure {}
        function modifier_internal_payable() internal payable {}
        function modifier_internal_nonpayable() internal nonpayable {}
      }"
    `);

    expect(formatAbi(solidityToAbi({ sourcePath: "test/Test.sol", source, contractName: "MyContract" })))
      .toMatchInlineSnapshot(`
      [
        "function modifier_public_null()",
        "function modifier_public_view() view",
        "function modifier_public_pure() pure",
        "function modifier_public_payable() payable",
        "function modifier_public_nonpayable()",
        "function modifier_external_null()",
        "function modifier_external_view() view",
        "function modifier_external_pure() pure",
        "function modifier_external_payable() payable",
        "function modifier_external_nonpayable()",
      ]
    `);
  });
});
