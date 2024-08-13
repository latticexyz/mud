import { describe, expect, it } from "vitest";
import { AbiFunction } from "viem";
import { concatBaseAbi } from "./concatBaseAbi";

const customAbiFunction = {
  type: "function",
  name: "setNumber",
  inputs: [{ name: "isNumberSet", type: "bool", internalType: "bool" }],
  outputs: [],
  stateMutability: "nonpayable",
} as AbiFunction;

const duplicateBatchCallAbi = {
  name: "batchCall",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [{ type: "tuple[]", components: [{ type: "bytes32" }, { type: "bytes" }] }],
  outputs: [],
} as AbiFunction;

describe("World ABI", () => {
  it("should concat base and world ABI", () => {
    const abi = concatBaseAbi([customAbiFunction, duplicateBatchCallAbi]);
    expect(abi).toContainEqual(customAbiFunction);
    expect(abi).not.toContainEqual(duplicateBatchCallAbi);
  });
});
