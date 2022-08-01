// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "../interfaces/ISystem.sol";
import { IWorld } from "../interfaces/IWorld.sol";
import { IOwned } from "../interfaces/IOwned.sol";
import { IUint256Component } from "../interfaces/IUint256Component.sol";
import { addressToEntity, entityToAddress, getAddressById } from "../utils.sol";
import { systemsComponentId } from "../constants.sol";
import { System } from "../System.sol";

enum RegisterType {
  Component,
  System
}

uint256 constant ID = uint256(keccak256("world.system.register"));

contract RegisterSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    // TODO: Refactor to remove requirement/execute split
  }

  function execute(
    address msgSender,
    RegisterType registerType,
    address addr,
    uint256 id
  ) public returns (bytes memory) {
    return execute(abi.encode(msgSender, registerType, addr, id));
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (address msgSender, RegisterType registerType, address addr, uint256 id) = abi.decode(
      arguments,
      (address, RegisterType, address, uint256)
    );
    require(msg.sender == address(world), "system can only be called via World");
    require(registerType == RegisterType.Component || registerType == RegisterType.System, "invalid type");
    require(id != 0, "invalid id");
    require(addr != address(0), "invalid address");

    IUint256Component registry = registerType == RegisterType.Component
      ? components
      : IUint256Component(getAddressById(components, systemsComponentId));
    uint256 entity = addressToEntity(addr);

    require(!registry.has(entity), "entity already registered");

    uint256[] memory entitiesWithId = registry.getEntitiesWithValue(id);

    require(
      entitiesWithId.length == 0 ||
        (entitiesWithId.length == 1 && IOwned(entityToAddress(entitiesWithId[0])).owner() == msgSender),
      "id already registered and caller not owner"
    );

    if (entitiesWithId.length == 1) {
      // Remove previous system
      registry.remove(entitiesWithId[0]);
    }

    registry.set(entity, id);
  }
}
