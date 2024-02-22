// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Position, PositionData, PlayersAtPosition } from "../codegen/index.sol";

function filter(address[] memory arr, address element) pure returns (address[] memory) {
  address[] memory filtered = new address[](arr.length);
  uint256 filteredIndex;
  for (uint256 i; i < arr.length; i++) {
    if (arr[i] != element) {
      filtered[filteredIndex] = arr[i];
      filteredIndex++;
    }
  }

  // In-place update the length of the array
  // (Note: this does not update the free memory pointer)
  assembly {
    mstore(filtered, filteredIndex)
  }

  return filtered;
}

function setPosition(address player, int32 x, int32 y) {
  // Cache the player's previous position
  PositionData memory previousPosition = Position.get(player);

  // Update the position
  Position.set(player, x, y);

  // Get all players at the previous position, except the player
  address[] memory playersAtPreviousPosition = filter(
    PlayersAtPosition.get(previousPosition.x, previousPosition.y),
    player
  );

  // set the entry to the filtered array
  PlayersAtPosition.set(previousPosition.x, previousPosition.y, playersAtPreviousPosition);

  // Push the player to the array for their new position
  PlayersAtPosition.push(x, y, player);
}
