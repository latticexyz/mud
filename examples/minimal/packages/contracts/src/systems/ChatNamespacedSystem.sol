// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { System } from "@latticexyz/world/src/System.sol";
import { MessageTable } from "../codegen/index.sol";

// This system is supposed to have a different namespace, but otherwise be identical to ChatSystem
contract ChatNamespacedSystem is System {
  function sendMessage(string memory message) public {
    MessageTable.set(message);
  }
}
