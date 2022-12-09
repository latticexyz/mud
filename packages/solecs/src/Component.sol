// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IEntityIndexer } from "./interfaces/IEntityIndexer.sol";
import { IWorld } from "./interfaces/IWorld.sol";
import { BareComponent } from "./BareComponent.sol";

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
abstract contract Component is BareComponent {
  /** Set of entities with values in this component */
  Set internal entities;

  /** Reverse mapping from value to set of entities */
  MapSet internal valueToEntities;

  /** List of indexers to be updated when a component value changes */
  IEntityIndexer[] internal indexers;

  constructor(IWorld _world) BareComponent(_world) {
    entities = new Set();
    valueToEntities = new MapSet();
  }

  /**
   * @inheritdoc BareComponent
   */
  function has(uint256 entity) public view virtual override returns (bool) {
    return entities.has(entity);
  }

  /**
   * Get a list of all entities that have a value in this component.
   */
  function getEntities() public view virtual override returns (uint256[] memory) {
    return entities.getItems();
  }

  /**
   * Get a list of all entities that have the specified value in this component.
   * @param value Abi-encoded value to get the list of entities with this value for.
   */
  function getEntitiesWithValue(bytes memory value) public view virtual override returns (uint256[] memory) {
    // Return all entities with this component value
    return valueToEntities.getItems(uint256(keccak256(value)));
  }

  /**
   * Register a new indexer that gets notified when a component value is set.
   * @param indexer Address of the indexer to notify when a component value is set.
   */
  function registerIndexer(address indexer) external virtual override onlyWriter {
    indexers.push(IEntityIndexer(indexer));
  }

  /**
   * @inheritdoc BareComponent
   */
  function _set(uint256 entity, bytes memory value) internal virtual override {
    // Store the entity
    entities.add(entity);

    // Remove the entity from the previous reverse mapping if there is one
    valueToEntities.remove(uint256(keccak256(entityToValue[entity])), entity);

    // Add the entity to the new reverse mapping
    valueToEntities.add(uint256(keccak256(value)), entity);

    // Store the entity's value; Emit global event
    super._set(entity, value);

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].update(entity, value);
    }
  }

  /**
   * @inheritdoc BareComponent
   */
  function _remove(uint256 entity) internal virtual override {
    // If there is no entity with this value, return
    if (valueToEntities.size(uint256(keccak256(entityToValue[entity]))) == 0) return;

    // Remove the entity from the reverse mapping
    valueToEntities.remove(uint256(keccak256(entityToValue[entity])), entity);

    // Remove the entity from the entity list
    entities.remove(entity);

    // Remove the entity from the mapping; Emit global event
    super._remove(entity);

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].remove(entity);
    }
  }
}
