// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

/**
 * Key value store with uint256 key and uint256 Set value
 */
contract MapSet {
  mapping(uint256 => uint256[]) private items;
  mapping(uint256 => mapping(uint256 => uint256)) private itemToIndex;

  function add(uint256 setKey, uint256 item) public {
    if (has(setKey, item)) return;

    itemToIndex[setKey][item] = items[setKey].length;
    items[setKey].push(item);
  }

  function remove(uint256 setKey, uint256 item) public {
    if (!has(setKey, item)) return;

    // Copy the last item to the given item's index
    items[setKey][itemToIndex[setKey][item]] = items[setKey][items[setKey].length - 1];

    // Update the moved item's stored index to the new index
    itemToIndex[setKey][items[setKey][itemToIndex[setKey][item]]] = itemToIndex[setKey][item];

    // Remove the given item's stored index
    delete itemToIndex[setKey][item];

    // Remove the last item
    items[setKey].pop();
  }

  function has(uint256 setKey, uint256 item) public view returns (bool) {
    if (items[setKey].length == 0) return false;
    if (itemToIndex[setKey][item] == 0) return items[setKey][0] == item;
    return itemToIndex[setKey][item] != 0;
  }

  function getItems(uint256 setKey) public view returns (uint256[] memory) {
    return items[setKey];
  }

  function size(uint256 setKey) public view returns (uint256) {
    return items[setKey].length;
  }
}
