// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";

import { OwnableWritable } from "./OwnableWritable.sol";

/**
 * Components are a key-value store from entity id to component value.
 * They are registered in the World and register updates to their state in the World.
 * They have an owner, who can grant write access to more addresses.
 * (Systems that want to write to a component need to be given write access first.)
 * Everyone has read access.
 */
abstract contract AbstractComponent is IComponent, OwnableWritable {
  /** Reference to the World contract this component is registered in */
  address public world;

  /** Public identifier of this component */
  uint256 public id;

  error AbstractComponent__NotImplemented();

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
   * Set the given component value for the given entity.
   * Registers the update in the World contract.
   * Can only be called internally (by the component or contracts deriving from it),
   * without requiring explicit write access.
   * @param entity Entity to set the value for.
   * @param value Value to set for the given entity.
   */
  function _set(uint256 entity, bytes memory value) internal virtual;

  /**
   * Remove the given entity from this component.
   * Registers the update in the World contract.
   * Can only be called internally (by the component or contracts deriving from it),
   * without requiring explicit write access.
   * @param entity Entity to remove from this component.
   */
  function _remove(uint256 entity) internal virtual;

  /** Not implemented in AbstractComponent */
  function getEntities() public view virtual override returns (uint256[] memory) {
    revert AbstractComponent__NotImplemented();
  }

  /** Not implemented in AbstractComponent */
  function getEntitiesWithValue(bytes memory) public view virtual override returns (uint256[] memory) {
    revert AbstractComponent__NotImplemented();
  }

  /** Not implemented in AbstractComponent */
  function registerIndexer(address) external virtual override {
    revert AbstractComponent__NotImplemented();
  }
}
