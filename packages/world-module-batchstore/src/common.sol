// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";

struct TableRecord {
  bytes32[] keyTuple;
  bytes staticData;
  EncodedLengths encodedLengths;
  bytes dynamicData;
}
