// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

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
abstract contract BareComponent is IComponent {
  error BareComponent__NotImplemented();

  /** Reference to the World contract this component is registered in */
  IWorld public world;

  /** Owner of the component has write access and can given write access to other addresses */
  address internal _owner;

  /** Addresses with write access to this component */
  mapping(address => bool) public writeAccess;

  /** Mapping from entity id to value in this component */
  mapping(uint256 => bytes) internal entityToValue;

  constructor(IWorld _world) {
    _owner = msg.sender;
    writeAccess[msg.sender] = true;
    world = _world;
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
  function owner() public view override returns (address) {
    return _owner;
  }

  /**
   * Transfer ownership of this component to a new owner.
   * Can only be called by the current owner.
   * @param newOwner Address of the new owner.
   */
  function transferOwnership(address newOwner) public override onlyOwner {
    emit OwnershipTransferred(_owner, newOwner);
    writeAccess[msg.sender] = false;
    _owner = newOwner;
    writeAccess[newOwner] = true;
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
   * Grant write access to this component to the given address.
   * Can only be called by the owner of this component.
   * @param writer Address to grant write access to.
   */
  function authorizeWriter(address writer) public override onlyOwner {
    writeAccess[writer] = true;
  }

  /**
   * Revoke write access to this component to the given address.
   * Can only be called by the owner of this component.
   * @param writer Address to revoke write access .
   */
  function unauthorizeWriter(address writer) public override onlyOwner {
    delete writeAccess[writer];
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
    world.registerComponentValueSet(entity, value);
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
    world.registerComponentValueRemoved(entity);
  }
}
