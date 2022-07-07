// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "../interfaces/ISystem.sol";
import { IWorld } from "../interfaces/IWorld.sol";
import { IUint256Component } from "../interfaces/IUint256Component.sol";
import { addressToEntity, getAddressById } from "../utils.sol";
import { systemsComponentId } from "../constants.sol";

enum RegisterType {
  Component,
  System
}

uint256 constant ID = uint256(keccak256("world.system.register"));

contract RegisterSystem is ISystem {
  IUint256Component components;

  constructor(IUint256Component _components) {
    components = _components;
  }

  function requirement(
    RegisterType registerType,
    address addr,
    uint256 id
  ) public view returns (bytes memory) {
    return requirement(abi.encode(registerType, addr, id));
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (RegisterType registerType, address addr, uint256 id) = abi.decode(arguments, (RegisterType, address, uint256));

    require(registerType == RegisterType.Component || registerType == RegisterType.System, "invalid type");
    require(id != 0, "invalid id");
    require(addr != address(0), "invalid address");

    IUint256Component registry = registerType == RegisterType.Component
      ? components
      : IUint256Component(getAddressById(components, systemsComponentId));
    uint256 entity = addressToEntity(addr);

    require(!registry.has(entity), "entity already registered");
    require(registry.getEntitiesWithValue(id).length == 0, "id already registered");

    return abi.encode(registry, entity, id);
  }

  function execute(
    RegisterType registerType,
    address addr,
    uint256 id
  ) public {
    return execute(abi.encode(registerType, addr, id));
  }

  function execute(bytes memory arguments) public {
    (IUint256Component registry, uint256 entity, uint256 id) = abi.decode(
      requirement(arguments),
      (IUint256Component, uint256, uint256)
    );

    registry.set(entity, id);
  }
}
