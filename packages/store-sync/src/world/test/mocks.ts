import { resourceToHex } from "@latticexyz/common";
import { stringToHex } from "viem";

export const mockSystem1Id = resourceToHex({ type: "system", namespace: "test", name: "system1" });
export const mockSystem2Id = resourceToHex({ type: "system", namespace: "test", name: "system2" });
export const mockSystem3Id = resourceToHex({ type: "system", namespace: "test", name: "system3" });

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
    resource: mockSystem1Fn,
    tag: stringToHex("worldAbi", { size: 32 }),
    value: stringToHex(`${mockWorldFn}\n${mockError}`),
  },
];
