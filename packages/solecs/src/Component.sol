// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IEntityIndexer } from "./interfaces/IEntityIndexer.sol";
import { IWorld } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";

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
abstract contract Component is IComponent {
  /** Reference to the World contract this component is registered in */
  address public world;

  /** Owner of the component has write access and can given write access to other addresses */
  address _owner;

  /** Addresses with write access to this component */
  mapping(address => bool) public writeAccess;

  /** Set of entities with values in this component */
  Set private entities;

  /** Mapping from entity id to value in this component */
  mapping(uint256 => bytes) private entityToValue;

  /** Reverse mapping from value to set of entities */
  MapSet private valueToEntities;

  /** List of indexers to be updated when a component value changes */
  IEntityIndexer[] internal indexers;

  /** Public identifier of this component */
  uint256 public id;

  constructor(address _world, uint256 _id) {
    entities = new Set();
    valueToEntities = new MapSet();
    _owner = msg.sender;
    writeAccess[msg.sender] = true;
    id = _id;
    if (_world != address(0)) registerWorld(_world);
  }

  /** Revert if caller is not the owner of this component */
  modifier onlyOwner() {
    require(msg.sender == _owner, "ONLY_OWNER");
    _;
  }

  /** Revert if caller does not have write access to this component */
  modifier onlyWriter() {
    require(writeAccess[msg.sender], "ONLY_WRITER");
    _;
  }

  /** Get the owner of this component */
  function owner() public view returns (address) {
    return _owner;
  }

  /**
   * Transfer ownership of this component to a new owner.
   * Can only be called by the current owner.
   * @param newOwner Address of the new owner.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    writeAccess[msg.sender] = false;
    _owner = newOwner;
    writeAccess[newOwner] = true;
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
   * Grant write access to this component to the given address.
   * Can only be called by the owner of this component.
   * @param writer Address to grant write access to.
   */
  function authorizeWriter(address writer) public onlyOwner {
    writeAccess[writer] = true;
  }

  /**
   * Return the keys and value types of the schema of this component.
   */
  function getSchema() public pure virtual returns (string[] memory keys, LibTypes.SchemaValue[] memory values);

  /**
   * Set the given component value for the given entity.
   * Registers the update in the World contract.
   * Can only be called by addresses with write access to this component.
   * @param entity Entity to set the value for.
   * @param value Value to set for the given entity.
   */
  function set(uint256 entity, bytes memory value) public onlyWriter {
    _set(entity, value);
  }

  /**
   * Remove the given entity from this component.
   * Registers the update in the World contract.
   * Can only be called by addresses with write access to this component.
   * @param entity Entity to remove from this component.
   */
  function remove(uint256 entity) public onlyWriter {
    _remove(entity);
  }

  /**
   * Check whether the given entity has a value in this component.
   * @param entity Entity to check whether it has a value in this component for.
   */
  function has(uint256 entity) public view returns (bool) {
    return entities.has(entity);
  }

  /**
   * Get the raw (abi-encoded) value of the given entity in this component.
   * @param entity Entity to get the raw value in this component for.
   */
  function getRawValue(uint256 entity) public view returns (bytes memory) {
    // Return the entity's component value
    return entityToValue[entity];
  }

  /**
   * Get a list of all entities that have a value in this component.
   */
  function getEntities() public view returns (uint256[] memory) {
    return entities.getItems();
  }

  /**
   * Get a list of all entities that have the specified value in this component.
   * @param value Abi-encoded value to get the list of entities with this value for.
   */
  function getEntitiesWithValue(bytes memory value) public view returns (uint256[] memory) {
    // Return all entities with this component value
    return valueToEntities.getItems(uint256(keccak256(value)));
  }

  /**
   * Register a new indexer that gets notified when a component value is set.
   * @param indexer Address of the indexer to notify when a component value is set.
   */
  function registerIndexer(address indexer) external onlyWriter {
    indexers.push(IEntityIndexer(indexer));
  }

  /**
   * Set the given component value for the given entity.
   * Registers the update in the World contract.
   * Can only be called internally (by the component or contracts deriving from it),
   * without requiring explicit write access.
   * @param entity Entity to set the value for.
   * @param value Value to set for the given entity.
   */
  function _set(uint256 entity, bytes memory value) internal {
    // Store the entity
    entities.add(entity);

    // Remove the entity from the previous reverse mapping if there is one
    valueToEntities.remove(uint256(keccak256(entityToValue[entity])), entity);

    // Store the entity's value;
    entityToValue[entity] = value;

    // Add the entity to the new reverse mapping
    valueToEntities.add(uint256(keccak256(value)), entity);

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].update(entity, value);
    }

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
  function _remove(uint256 entity) internal {
    // If there is no entity with this value, return
    if (valueToEntities.size(uint256(keccak256(entityToValue[entity]))) == 0) return;

    // Remove the entity from the reverse mapping
    valueToEntities.remove(uint256(keccak256(entityToValue[entity])), entity);

    // Remove the entity from the entity list
    entities.remove(entity);

    // Remove the entity from the mapping
    delete entityToValue[entity];

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].remove(entity);
    }

    // Emit global event
    IWorld(world).registerComponentValueRemoved(entity);
  }
}
