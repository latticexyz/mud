import { AbiType } from "@latticexyz/schema-type";

// TODO: move to schema-type?
// TODO: add default values for all abi types
export const AbiDefaults = {
  bytes: "0x00",
  string: "",
  uint256: 0n,
  int32: 0,
} as any satisfies { [key in AbiType]: unknown };
