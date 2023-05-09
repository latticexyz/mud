// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

struct Record {
  bytes32 tableId;
  bytes32[] keyTuple;
  bytes value;
}
