// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { MessageTable } from "../codegen/index.sol";

// This system has a different namespace, but is otherwise identical to ChatSystem
contract namespace__ChatSystem is System {
  function sendMessage(string memory message) public {
    MessageTable.set(message);
  }
}
