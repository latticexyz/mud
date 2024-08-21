/* eslint-disable max-len */
import { describe, expect, it } from "vitest";
import { formatAbi } from "abitype";
import { solidityToAbi } from "./solidityToAbi";

const functionVisibility = ["public", "external", "private", "internal"] as const;
const functionMutability = [null, "view", "pure", "payable", "nonpayable"] as const;

const types = {
  uint256: "uint256",
  uint: "uint",
  payable: "address payable",
  stringMemory: "string memory",
  stringCalldata: "string calldata",
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
      ...Object.entries(types).map(([name, type]) => `error param_${name}(${type} _${name});`),
      `error allParams(${Object.entries(types)
        .map(([name, type]) => `${type} _${name}`)
        .join(", ")});`,
    ];
    const source = `contract MyContract {\n  ${errors.join("\n  ")}\n}`;

    expect(source).toMatchInlineSnapshot(`
      "contract MyContract {
        error noParam();
        error param_uint256(uint256 _uint256);
        error param_uint(uint _uint);
        error param_payable(address payable _payable);
        error param_stringMemory(string memory _stringMemory);
        error param_stringCalldata(string calldata _stringCalldata);
        error param_uintArray(uint[] _uintArray);
        error param_stringArray(string[] _stringArray);
        error param_keyTuples(bytes32[][] _keyTuples);
        error param_fixedArray(bool[2] _fixedArray);
        error param_mixedArray(bool[2][] _mixedArray);
        error param_deepArray(bool[][2][4][8][] _deepArray);
        error allParams(uint256 _uint256, uint _uint, address payable _payable, string memory _stringMemory, string calldata _stringCalldata, uint[] _uintArray, string[] _stringArray, bytes32[][] _keyTuples, bool[2] _fixedArray, bool[2][] _mixedArray, bool[][2][4][8][] _deepArray);
      }"
    `);

    expect(
      formatAbi(solidityToAbi({ sourcePath: "test/Test.sol", source, contractName: "MyContract" })),
    ).toMatchInlineSnapshot(
      `
      [
        "error noParam()",
        "error param_uint256(uint256 _uint256)",
        "error param_uint(uint _uint)",
        "error param_payable(address _payable)",
        "error param_stringMemory(string _stringMemory)",
        "error param_stringCalldata(string _stringCalldata)",
        "error param_uintArray(uint[] _uintArray)",
        "error param_stringArray(string[] _stringArray)",
        "error param_keyTuples(bytes32[][] _keyTuples)",
        "error param_fixedArray(bool[2] _fixedArray)",
        "error param_mixedArray(bool[2][] _mixedArray)",
        "error param_deepArray(bool[][2][4][8][] _deepArray)",
        "error allParams(uint256 _uint256, uint _uint, address _payable, string _stringMemory, string _stringCalldata, uint[] _uintArray, string[] _stringArray, bytes32[][] _keyTuples, bool[2] _fixedArray, bool[2][] _mixedArray, bool[][2][4][8][] _deepArray)",
      ]
    `,
    );
  });

  it("parses function params", () => {
    const functions = [
      "function noParams() public {}",
      ...Object.entries(types).map(([name, type]) => `function param_${name}(${type} value) public {}`),
      `function allParams(${Object.entries(types)
        .map(([name, type]) => `${type} _${name}`)
        .join(", ")}) public {}`,
    ];
    const source = `contract MyContract {\n  ${functions.join("\n  ")}\n}`;

    expect(source).toMatchInlineSnapshot(`
      "contract MyContract {
        function noParams() public {}
        function param_uint256(uint256 value) public {}
        function param_uint(uint value) public {}
        function param_payable(address payable value) public {}
        function param_stringMemory(string memory value) public {}
        function param_stringCalldata(string calldata value) public {}
        function param_uintArray(uint[] value) public {}
        function param_stringArray(string[] value) public {}
        function param_keyTuples(bytes32[][] value) public {}
        function param_fixedArray(bool[2] value) public {}
        function param_mixedArray(bool[2][] value) public {}
        function param_deepArray(bool[][2][4][8][] value) public {}
        function allParams(uint256 _uint256, uint _uint, address payable _payable, string memory _stringMemory, string calldata _stringCalldata, uint[] _uintArray, string[] _stringArray, bytes32[][] _keyTuples, bool[2] _fixedArray, bool[2][] _mixedArray, bool[][2][4][8][] _deepArray) public {}
      }"
    `);

    expect(formatAbi(solidityToAbi({ sourcePath: "test/Test.sol", source, contractName: "MyContract" })))
      .toMatchInlineSnapshot(`
        [
          "function noParams()",
          "function param_uint256(uint256 value)",
          "function param_uint(uint value)",
          "function param_payable(address value)",
          "function param_stringMemory(string value)",
          "function param_stringCalldata(string value)",
          "function param_uintArray(uint[] value)",
          "function param_stringArray(string[] value)",
          "function param_keyTuples(bytes32[][] value)",
          "function param_fixedArray(bool[2] value)",
          "function param_mixedArray(bool[2][] value)",
          "function param_deepArray(bool[][2][4][8][] value)",
          "function allParams(uint256 _uint256, uint _uint, address _payable, string _stringMemory, string _stringCalldata, uint[] _uintArray, string[] _stringArray, bytes32[][] _keyTuples, bool[2] _fixedArray, bool[2][] _mixedArray, bool[][2][4][8][] _deepArray)",
        ]
      `);
  });

  it("parses public/external functions", () => {
    const modifiers = functionVisibility.flatMap((vis) => functionMutability.map((mut) => [vis, mut] as const));

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
