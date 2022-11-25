// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

/**
 * Set of unique uint256
 */
contract Set {
  address private owner;
  uint256[] internal items;
  mapping(uint256 => uint256) internal itemToIndex;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "ONLY_OWNER");
    _;
  }

  function add(uint256 item) public onlyOwner {
    if (has(item)) return;

    itemToIndex[item] = items.length;
    items.push(item);
  }

  function remove(uint256 item) public onlyOwner {
    if (!has(item)) return;

    // Copy the last item to the given item's index
    items[itemToIndex[item]] = items[items.length - 1];

    // Update the moved item's stored index to the new index
    itemToIndex[items[itemToIndex[item]]] = itemToIndex[item];

    // Remove the given item's stored index
    delete itemToIndex[item];

    // Remove the last item
    items.pop();
  }

  function getIndex(uint256 item) public view returns (bool, uint256) {
    if (!has(item)) return (false, 0);

    return (true, itemToIndex[item]);
  }

  function has(uint256 item) public view returns (bool) {
    if (items.length == 0) return false;
    if (itemToIndex[item] == 0) return items[0] == item;
    return itemToIndex[item] != 0;
  }

  function getItems() public view returns (uint256[] memory) {
    return items;
  }

  function size() public view returns (uint256) {
    return items.length;
  }
}
