// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";

import { TodoItem, TodoItemData, Owned } from "../codegen/Tables.sol";

import { getUniqueEntity } from "@latticexyz/world/src/modules/uniqueentity/getUniqueEntity.sol";

function addressToEntity(address a) pure returns (bytes32) {
  return bytes32(uint256(uint160((a))));
}

contract TodoSystem is System {
  function add(string memory body) public {
    bytes32 user = addressToEntity(_msgSender());
    bytes32 todoKey = getUniqueEntity();

    TodoItem.set(todoKey, TodoItemData({ body: body, completed: false }));
    Owned.set(todoKey, user);
  }

  function modify(bytes32 key, string memory body) public onlyOwner(key) {
    TodoItem.setBody(key, body);
  }

  function remove(bytes32 key) public onlyOwner(key) {
    Owned.deleteRecord(key);
    TodoItem.deleteRecord(key);
  }

  function toggleComplete(bytes32 key) public onlyOwner(key) {
    TodoItem.setCompleted(key, !TodoItem.get(key).completed);
  }

  modifier onlyOwner(bytes32 key) {
    require(Owned.get(key) == addressToEntity(_msgSender()), "Only owner can modify todo");
    _;
  }
}
