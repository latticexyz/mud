// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { MessageTable } from "../codegen/Tables.sol";

bytes32 constant SingletonKey = bytes32(uint256(0x060D));

contract ChatSystem is System {
  function sendMessage(string memory message) public returns (uint32) {
    MessageTable.setEphemeral(SingletonKey, message);
  }
}
