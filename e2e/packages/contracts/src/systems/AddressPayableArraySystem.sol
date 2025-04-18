// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

contract AddressPayableArraySystem is System {
  function getAddressPayableArray(address payable[] memory array) public pure returns (address payable[] memory) {
    return array;
  }
}
