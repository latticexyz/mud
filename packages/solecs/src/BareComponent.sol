// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "./interfaces/IWorld.sol";
import { AbstractComponent } from "./AbstractComponent.sol";

import { Set } from "./Set.sol";
import { MapSet } from "./MapSet.sol";
import { LibTypes } from "./LibTypes.sol";

/**
 * Components are a key-value store from entity id to component value.
 * They are registered in the World and register updates to their state in the World.
 * They have an owner, who can grant write access to more addresses.
 * (Systems that want to write to a component need to be given write access first.)
 * Everyone has read access.
 */
abstract contract BareComponent is AbstractComponent {
  /** Mapping from entity id to value in this component */
  mapping(uint256 => bytes) internal entityToValue;

  constructor(address _world, uint256 _id) AbstractComponent(_world, _id) {}

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

  /**
   * Set the given component value for the given entity.
   * Registers the update in the World contract.
   * Can only be called internally (by the component or contracts deriving from it),
   * without requiring explicit write access.
   * @param entity Entity to set the value for.
   * @param value Value to set for the given entity.
   */
  function _set(uint256 entity, bytes memory value) internal virtual override {
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
  function _remove(uint256 entity) internal virtual override {
    // Remove the entity from the mapping
    delete entityToValue[entity];

    // Emit global event
    IWorld(world).registerComponentValueRemoved(entity);
  }
}
