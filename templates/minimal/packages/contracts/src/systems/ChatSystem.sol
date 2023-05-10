// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { MessageTable } from "../codegen/Tables.sol";

contract ChatSystem is System {
  function sendMessage(string memory message) public {
    MessageTable.emitEphemeral(message);
  }
}
