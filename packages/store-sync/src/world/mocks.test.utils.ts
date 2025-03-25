import { stringToHex } from "viem";

export const mockSystem1Id = "0x7379415741520000000000000000000054726962654761746553504600000000";
export const mockSystem2Id = "0x73794b616c69706174750000000000005469636b657453797374656d00000000";
export const mockSystem3Id = "0x737952414c4f42485f53535500000000536d61727453746f72616765556e6974";

export const mockSystem1Fn = "function systemFn(uint256 arg1, bool arg2) pure returns (uint256)";
export const mockSystem2Fn = "function systemFn2(uint256 arg1, bool arg2) pure returns (uint256)";

export const mockWorldFn = "function test_WorldFunction(uint256 arg1, bool arg2) pure returns (uint256)";
export const mockError = "error Error(string message)";

const WORLD_ABI_TAG = "0x776f726c64416269000000000000000000000000000000000000000000000000";
const SYSTEM_ABI_TAG = "0x6162690000000000000000000000000000000000000000000000000000000000";
const LABEL_TAG = "0x6c6162656c000000000000000000000000000000000000000000000000000000";

export const mockMetadata = [
  {
    resource: "0x7379415741520000000000000000000054726962655475727265740000000000",
    tag: WORLD_ABI_TAG,
    value: stringToHex(`${mockWorldFn}\n${mockError}`),
  },
  {
    resource: mockSystem1Id,
    tag: SYSTEM_ABI_TAG,
    value: stringToHex(`${mockSystem1Fn}\n${mockError}`),
  },
  {
    resource: mockSystem2Id,
    tag: SYSTEM_ABI_TAG,
    value: stringToHex(`${mockSystem2Fn}\n${mockError}`),
  },
  {
    resource: mockSystem1Id,
    tag: LABEL_TAG,
    value: stringToHex("System 1"),
  },
];
