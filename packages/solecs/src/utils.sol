// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IComponent } from "./interfaces/IComponent.sol";
import { ISystem } from "./interfaces/ISystem.sol";
import { systemsComponentId } from "./constants.sol";

/** Turn an entity ID into its corresponding Ethereum address. */
function entityToAddress(uint256 entity) pure returns (address) {
  return address(uint160(entity));
}

/** Turn an Ethereum address into its corresponding entity ID. */
function addressToEntity(address addr) pure returns (uint256) {
  return uint256(uint160(addr));
}

/** Get an Ethereum address from an address/id registry component (like _components/_systems in World.sol) */
function getAddressById(IUint256Component registry, uint256 id) view returns (address) {
  uint256[] memory entities = registry.getEntitiesWithValue(id);
  require(entities.length != 0, "id not registered");
  return entityToAddress(entities[0]);
}

/** Get an entity id from an address/id registry component (like _components/_systems in World.sol) */
function getIdByAddress(IUint256Component registry, address addr) view returns (uint256) {
  require(registry.has(addressToEntity(addr)), "address not registered");
  return registry.getValue(addressToEntity(addr));
}

/** Get a Component from an address/id registry component (like _components in World.sol) */
function getComponentById(IUint256Component components, uint256 id) view returns (IComponent) {
  return IComponent(getAddressById(components, id));
}

/**
 * Get the Ethereum address of a System from an address/id component registry component in which the
 * System registry component is registered (like _components in World.sol)
 */
function getSystemAddressById(IUint256Component components, uint256 id) view returns (address) {
  IUint256Component systems = IUint256Component(getAddressById(components, systemsComponentId));
  return getAddressById(systems, id);
}

/**
 * Get a System from an address/id component registry component in which the
 * System registry component is registered (like _components in World.sol)
 */
function getSystemById(IUint256Component components, uint256 id) view returns (ISystem) {
  return ISystem(getSystemAddressById(components, id));
}

/** Split a single bytes blob into an array of bytes of the given length */
function split(bytes memory data, uint8[] memory lengths) pure returns (bytes[] memory) {
  bytes[] memory unpacked = new bytes[](lengths.length);
  uint256 sum = 0;
  for (uint256 i = 0; i < lengths.length; ) {
    unpacked[i] = new bytes(lengths[i]);
    for (uint256 j = 0; j < lengths[i]; ) {
      unchecked {
        unpacked[i][j] = data[sum + j];
        j += 1;
      }
    }
    unchecked {
      sum += lengths[i];
      i += 1;
    }
  }
  return unpacked;
}
