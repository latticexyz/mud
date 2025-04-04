import { stringToHex } from "viem";

export const mockSystem1Id = stringToHex("system1", { size: 32 });
export const mockSystem2Id = stringToHex("system2", { size: 32 });
export const mockSystem3Id = stringToHex("system3", { size: 32 });

export const mockSystem1Fn = "function systemFn(uint256 arg1, bool arg2) pure returns (uint256)";
export const mockSystem2Fn = "function systemFn2(uint256 arg1, bool arg2) pure returns (uint256)";
export const mockWorldFn = "function test_WorldFunction(uint256 arg1, bool arg2) pure returns (uint256)";
export const mockWorldFn2 = "function setNumber(bool)";
export const mockError = "error Error(string message)";

export const mockMetadata = [
  {
    resource: mockSystem1Id,
    tag: stringToHex("abi", { size: 32 }),
    value: stringToHex(`${mockSystem1Fn}\n${mockError}`),
  },
  {
    resource: mockSystem2Id,
    tag: stringToHex("abi", { size: 32 }),
    value: stringToHex(`${mockSystem2Fn}\n${mockError}`),
  },
  {
    resource: mockSystem1Id,
    tag: stringToHex("label", { size: 32 }),
    value: stringToHex("System 1"),
  },
  {
    resource: stringToHex("world", { size: 32 }),
    tag: stringToHex("worldAbi", { size: 32 }),
    value: stringToHex(`${mockWorldFn}\n${mockError}`),
  },
];
