// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import '@openzeppelin/contracts/utils/introspection/ERC165Checker.sol';

import { IEntityIndexer } from './interfaces/IEntityIndexer.sol';

import { Set } from './Set.sol';
import { World } from './World.sol';

abstract contract Component {
  address public world;
  address public owner;

  Set private entities;
  mapping(bytes => address) private valueToEntities;
  mapping(uint256 => bytes) private entityToValue;
  IEntityIndexer[] internal indexers;

  constructor(address _world) {
    world = _world;
    World(_world).registerComponent(address(this), getID());
    entities = new Set();
    owner = msg.sender;
  }

  modifier onlyContractOwner() {
    require(msg.sender == owner, 'ONLY_CONTRACT_OWNER');
    _;
  }

  function transferOwnership(address newOwner) public onlyContractOwner {
    owner = newOwner;
  }

  function getID() public pure virtual returns (uint256);

  function set(uint256 entity, bytes memory value) public onlyContractOwner {
    // Store the entity
    entities.add(entity);

    // Store the entity's value;
    entityToValue[entity] = value;

    // Store the reverse mapping
    if (valueToEntities[value] == address(0)) {
      valueToEntities[value] = address(new Set());
    }
    Set(valueToEntities[value]).add(entity);

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].update(entity, value);
    }

    // Emit global event
    World(world).registerComponentValueSet(address(this), entity, value);
  }

  function remove(uint256 entity) public onlyContractOwner {
    // if there is no entity with this value, return
    if (valueToEntities[entityToValue[entity]] == address(0)) return;

    // Remove the entity from the reverse mapping
    Set(valueToEntities[entityToValue[entity]]).remove(entity);

    // Remove the entity from the entity list
    entities.remove(entity);

    // Remove the entity from the mapping
    delete entityToValue[entity];

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].remove(entity);
    }

    // Emit global event
    World(world).registerComponentValueRemoved(address(this), entity);
  }

  function has(uint256 entity) public view returns (bool) {
    return entities.has(entity);
  }

  function getRawValue(uint256 entity) public view returns (bytes memory) {
    // Return the entity's component value
    return entityToValue[entity];
  }

  function getEntities() public view returns (uint256[] memory) {
    return entities.getItems();
  }

  function getEntitiesWithValue(bytes memory value) public view returns (uint256[] memory) {
    if (valueToEntities[value] == address(0)) {
      return new uint256[](0);
    }

    // Return all entities with this component value
    return Set(valueToEntities[value]).getItems();
  }

  function registerIndexer(address indexer) external onlyContractOwner {
    require(
      ERC165Checker.supportsInterface(indexer, type(IEntityIndexer).interfaceId),
      'Given address is not an indexer.'
    );
    indexers.push(IEntityIndexer(indexer));
  }
}
