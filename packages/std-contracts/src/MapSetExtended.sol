// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { MapSet } from "solecs/MapSet.sol";

/**
 * MapSet with batch removal/replacement of values for given key
 */
contract MapSetExtended is MapSet {
  function removeAll(uint256 setKey) public onlyOwner {
    if (size(setKey) == 0) return;

    uint256 length = items[setKey].length;
    for (uint256 i; i < length; i++) {
      // Remove each item's stored index
      delete itemToIndex[setKey][items[setKey][i]];
    }

    // Remove the list of items
    delete items[setKey];
  }

  function replaceAll(uint256 setKey, uint256[] calldata _items) public onlyOwner {
    removeAll(setKey);

    items[setKey] = _items;

    for (uint256 i; i < _items.length; i++) {
      itemToIndex[setKey][_items[i]] = i;
    }
  }
}
