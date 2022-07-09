// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IComponent } from "./interfaces/IComponent.sol";
import { ISystem } from "./interfaces/ISystem.sol";
import { systemsComponentId } from "./constants.sol";

function entityToAddress(uint256 entity) pure returns (address) {
  return address(uint160(entity));
}

function addressToEntity(address addr) pure returns (uint256) {
  return uint256(uint160(addr));
}

function getAddressById(IUint256Component registry, uint256 id) view returns (address) {
  uint256[] memory entities = registry.getEntitiesWithValue(id);
  require(entities.length != 0, "id not registered");
  return entityToAddress(entities[0]);
}

function getIdByAddress(IUint256Component registry, address addr) view returns (uint256) {
  require(registry.has(addressToEntity(addr)), "address not registered");
  return registry.getValue(addressToEntity(addr));
}

function getComponentById(IUint256Component components, uint256 id) view returns (IComponent) {
  return IComponent(getAddressById(components, id));
}

function getSystemAddressById(IUint256Component components, uint256 id) view returns (address) {
  IUint256Component systems = IUint256Component(getAddressById(components, systemsComponentId));
  return getAddressById(systems, id);
}

function getSystemById(IUint256Component components, uint256 id) view returns (ISystem) {
  return ISystem(getSystemAddressById(components, id));
}
