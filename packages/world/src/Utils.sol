// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

function bytes32ToBool(bytes32 input) pure returns (bool output) {
  assembly {
    output := input
  }
}
