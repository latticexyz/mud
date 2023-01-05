// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibTypes } from "solecs/LibTypes.sol";
import { AbstractComponent } from "solecs/AbstractComponent.sol";

import { MapSetExtended } from "../MapSetExtended.sol";

/**
 * An alternative to Uint256ArrayBareComponent,
 * hasItem allows checking existence in O(1) instead of reading the whole array.
 *
 * There's also addItem and removeItem, which don't write the whole array
 * (though they still read it all for world value registration).
 */
contract Uint256SetBareComponent is AbstractComponent {
  MapSetExtended internal entityToItemSet;

  constructor(address _world, uint256 _id) AbstractComponent(_world, _id) {
    entityToItemSet = new MapSetExtended();
  }

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "value";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;
  }

  /**
   * Replace the whole set.
   * Use addItem to add individual items.
   */
  function set(uint256 entity, uint256[] memory value) public onlyWriter {
    _set(entity, value);
  }

  /**
   * Check whether the given entity has a value in this component.
   * @param entity Entity to check whether it has a value in this component for.
   */
  function has(uint256 entity) public view virtual override returns (bool) {
    return itemSetSize(entity) != 0;
  }

  /**
   * Get the size of the given entity's item set.
   * @dev Set-specific
   */
  function itemSetSize(uint256 entity) public view virtual returns (uint256) {
    return entityToItemSet.size(entity);
  }

  /**
   * Get the raw (abi-encoded) value of the given entity in this component.
   * @param entity Entity to get the raw value in this component for.
   */
  function getRawValue(uint256 entity) public view virtual override returns (bytes memory) {
    return abi.encode(getValue(entity));
  }

  /**
   * Get all items in the set as an array.
   */
  function getValue(uint256 entity) public view virtual returns (uint256[] memory) {
    return entityToItemSet.getItems(entity);
  }

  /**
   * Check if the set has `item`.
   * @dev Set-specific
   */
  function hasItem(uint256 entity, uint256 item) public view virtual returns (bool) {
    return entityToItemSet.has(entity, item);
  }

  /**
   * Add `item` to the set.
   * @dev Set-specific
   */
  function addItem(uint256 entity, uint256 item) public onlyWriter {
    _addItem(entity, item);
  }

  /**
   * Remove `item` from the set.
   * @dev Set-specific
   */
  function removeItem(uint256 entity, uint256 item) public onlyWriter {
    _removeItem(entity, item);
  }

  /**
   * @inheritdoc AbstractComponent
   */
  function _set(uint256 entity, bytes memory value) internal virtual override {
    _set(entity, abi.decode(value, (uint256[])));
  }

  function _set(uint256 entity, uint256[] memory items) internal virtual {
    entityToItemSet.replaceAll(entity, items);

    IWorld(world).registerComponentValueSet(entity, abi.encode(items));
  }

  function _remove(uint256 entity) internal virtual override {
    entityToItemSet.removeAll(entity);

    IWorld(world).registerComponentValueRemoved(entity);
  }

  /**
   * Add `item` to the set.
   * @dev Set-specific
   */
  function _addItem(uint256 entity, uint256 item) internal virtual {
    if (hasItem(entity, item)) {
      // item is already in set
      return;
    }

    entityToItemSet.add(entity, item);

    IWorld(world).registerComponentValueSet(entity, abi.encode(entityToItemSet.getItems(entity)));
  }

  /**
   * Remove `item` from the set.
   * @dev Set-specific
   */
  function _removeItem(uint256 entity, uint256 item) internal virtual {
    if (!hasItem(entity, item)) {
      // item is not in set
      return;
    }

    entityToItemSet.remove(entity, item);

    IWorld(world).registerComponentValueSet(entity, abi.encode(entityToItemSet.getItems(entity)));
  }
}
