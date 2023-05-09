// TODO: add default values for all abi types

import { AbiType } from "@latticexyz/schema-type";

// TODO: maybe move to schema-type?
export const AbiDefaults = {
  bytes: "0x00",
  string: "",
  uint256: BigInt(0),
} as any satisfies { [key in AbiType]: unknown };
