// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Tasks, TasksData } from "../codegen/index.sol";

contract TasksSystem is System {
  function addTask(string memory description) public returns (bytes32 key) {
    key = keccak256(abi.encode(block.prevrandao, _msgSender(), description));
    Tasks.set(key, TasksData({ description: description, createdAt: block.timestamp, completedAt: 0 }));
  }

  function completeTask(bytes32 key) public {
    Tasks.setCompletedAt(key, block.timestamp);
  }

  function resetTask(bytes32 key) public {
    Tasks.setCompletedAt(key, 0);
  }

  function deleteTask(bytes32 key) public {
    Tasks.deleteRecord(key);
  }
}
