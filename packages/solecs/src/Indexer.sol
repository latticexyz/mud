// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IERC165 } from "./interfaces/IERC165.sol";
import { IEntityContainer } from "./interfaces/IEntityContainer.sol";
import { IEntityIndexer } from "./interfaces/IEntityIndexer.sol";

import { Set } from "./Set.sol";
import { Component } from "./Component.sol";

contract Indexer is IEntityIndexer, IERC165 {
  Set private entities;
  mapping(bytes => address) internal valueToEntities;
  mapping(uint256 => bytes) internal entityToValue;
  Component[] private components;
  bool[] private trackValueForComponent;

  constructor(Component[] memory _components, bool[] memory _trackValueForComponent) {
    components = _components;
    trackValueForComponent = _trackValueForComponent;
    entities = new Set();
  }

  function update(uint256 entity, bytes memory value) external {
    Component component = Component(msg.sender);
    bytes[] memory values = new bytes[](components.length);
    uint256 index;
    bool foundSenderComponent;

    for (uint256 i; i < components.length; i++) {
      if (components[i] == component) {
        foundSenderComponent = true;
      }
    }

    require(foundSenderComponent, "Message Sender is not indexed!");

    // If data for entity doesn't exist yet create it
    if (entityToValue[entity].length == 0) {
      // Get all component values from ECS
      for (uint256 i = 0; i < components.length; i++) {
        // Get ECS Value (or set new value)
        values[i] = components[i] == component ? value : components[i].getRawValue(entity);

        // If one of the tracked values does not exist yet we can't index
        if (values[i].length == 0) {
          return;
        }

        // Ignore non tracked values
        if (!trackValueForComponent[i]) {
          values[i] = new bytes(0);
        }
      }

      _set(entity, values);
      return;
    }

    // Get index of current component
    for (uint256 i; i < components.length; i++) {
      if (components[i] == component) {
        index = i;
      }
    }

    values = abi.decode(entityToValue[entity], (bytes[]));
    // Set value at index
    values[index] = value;

    // Remove old value
    Set(valueToEntities[entityToValue[entity]]).remove(entity);

    // Add new value
    bytes memory indexerValue = abi.encode(values);

    entityToValue[entity] = indexerValue;

    // Store the reverse mapping
    if (valueToEntities[indexerValue] == address(0)) {
      valueToEntities[indexerValue] = address(new Set());
    }
    Set(valueToEntities[indexerValue]).add(entity);
  }

  function remove(uint256 entity) external {
    Component component = Component(msg.sender);
    bool foundSenderComponent;

    for (uint256 i; i < components.length; i++) {
      if (components[i] == component) {
        foundSenderComponent = true;
      }
    }

    require(foundSenderComponent, "Message Sender is not indexed!");

    // if there is no entity with this value, return
    if (!has(entity)) return;

    // Remove the entity from the reverse mapping
    Set(valueToEntities[entityToValue[entity]]).remove(entity);

    // Remove the entity from the entity list
    entities.remove(entity);

    // Remove the entity from the mapping
    delete entityToValue[entity];
  }

  function supportsInterface(bytes4 interfaceId) external view returns (bool) {
    return interfaceId == type(IERC165).interfaceId || interfaceId == type(IEntityIndexer).interfaceId;
  }

  function getEntities() external view returns (uint256[] memory) {
    return entities.getItems();
  }

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory) {
    if (valueToEntities[value] == address(0)) {
      return new uint256[](0);
    }

    // Return all entities with this component value
    return Set(valueToEntities[value]).getItems();
  }

  function has(uint256 entity) public view returns (bool) {
    return entities.has(entity);
  }

  function _set(uint256 entity, bytes[] memory newValues) internal {
    require(newValues.length == components.length, "Need values for all components.");

    // Store the entity
    entities.add(entity);

    bytes memory indexerValue = abi.encode(newValues);

    // Store the entity's value;
    entityToValue[entity] = indexerValue;

    // Store the reverse mapping
    if (valueToEntities[indexerValue] == address(0)) {
      valueToEntities[indexerValue] = address(new Set());
    }

    Set(valueToEntities[indexerValue]).add(entity);
  }
}
