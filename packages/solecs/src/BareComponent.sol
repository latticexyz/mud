// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";

import { Set } from "./Set.sol";
import { MapSet } from "./MapSet.sol";
import { LibTypes } from "./LibTypes.sol";

import { OwnableWritable } from "./OwnableWritable.sol";

/**
 * Components are a key-value store from entity id to component value.
 * They are registered in the World and register updates to their state in the World.
 * They have an owner, who can grant write access to more addresses.
 * (Systems that want to write to a component need to be given write access first.)
 * Everyone has read access.
 */
abstract contract BareComponent is IComponent, OwnableWritable {
  error BareComponent__NotImplemented();

  /** Reference to the World contract this component is registered in */
  address public world;

  /** Mapping from entity id to value in this component */
  mapping(uint256 => bytes) internal entityToValue;

  /** Public identifier of this component */
  uint256 public id;

  constructor(address _world, uint256 _id) {
    id = _id;
    if (_world != address(0)) registerWorld(_world);
  }

  /**
   * Register this component in the given world.
   * @param _world Address of the World contract.
   */
  function registerWorld(address _world) public onlyOwner {
    world = _world;
    IWorld(world).registerComponent(address(this), id);
  }

  /**
   * Set the given component value for the given entity.
   * Registers the update in the World contract.
   * Can only be called by addresses with write access to this component.
   * @param entity Entity to set the value for.
   * @param value Value to set for the given entity.
   */
  function set(uint256 entity, bytes memory value) public override onlyWriter {
    _set(entity, value);
  }

  /**
   * Remove the given entity from this component.
   * Registers the update in the World contract.
   * Can only be called by addresses with write access to this component.
   * @param entity Entity to remove from this component.
   */
  function remove(uint256 entity) public override onlyWriter {
    _remove(entity);
  }

  /**
   * Check whether the given entity has a value in this component.
   * @param entity Entity to check whether it has a value in this component for.
   */
  function has(uint256 entity) public view virtual override returns (bool) {
    return entityToValue[entity].length != 0;
  }

  /**
   * Get the raw (abi-encoded) value of the given entity in this component.
   * @param entity Entity to get the raw value in this component for.
   */
  function getRawValue(uint256 entity) public view virtual override returns (bytes memory) {
    // Return the entity's component value
    return entityToValue[entity];
  }

  /** Not implemented in BareComponent */
  function getEntities() public view virtual override returns (uint256[] memory) {
    revert BareComponent__NotImplemented();
  }

  /** Not implemented in BareComponent */
  function getEntitiesWithValue(bytes memory) public view virtual override returns (uint256[] memory) {
    revert BareComponent__NotImplemented();
  }

  /** Not implemented in BareComponent */
  function registerIndexer(address) external virtual override {
    revert BareComponent__NotImplemented();
  }

  /**
   * Set the given component value for the given entity.
   * Registers the update in the World contract.
   * Can only be called internally (by the component or contracts deriving from it),
   * without requiring explicit write access.
   * @param entity Entity to set the value for.
   * @param value Value to set for the given entity.
   */
  function _set(uint256 entity, bytes memory value) internal virtual {
    // Store the entity's value;
    entityToValue[entity] = value;

    // Emit global event
    IWorld(world).registerComponentValueSet(entity, value);
  }

  /**
   * Remove the given entity from this component.
   * Registers the update in the World contract.
   * Can only be called internally (by the component or contracts deriving from it),
   * without requiring explicit write access.
   * @param entity Entity to remove from this component.
   */
  function _remove(uint256 entity) internal virtual {
    // Remove the entity from the mapping
    delete entityToValue[entity];

    // Emit global event
    IWorld(world).registerComponentValueRemoved(entity);
  }
}
