// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import { IEntityIndexer } from "./interfaces/IEntityIndexer.sol";
import { IWorld } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";

import { Set } from "./Set.sol";
import { MapSet } from "./MapSet.sol";
import { LibTypes } from "./LibTypes.sol";

abstract contract Component is IComponent {
  address public world;
  address public owner;

  Set private entities;
  MapSet private valueToEntities;
  mapping(uint256 => bytes) private entityToValue;
  IEntityIndexer[] internal indexers;

  constructor(address _world) {
    world = _world;
    IWorld(_world).registerComponent(address(this), getID());
    entities = new Set();
    valueToEntities = new MapSet();
    owner = msg.sender;
  }

  modifier onlyContractOwner() {
    require(msg.sender == owner, "ONLY_CONTRACT_OWNER");
    _;
  }

  function transferOwnership(address newOwner) public onlyContractOwner {
    owner = newOwner;
  }

  function getSchema() public pure virtual returns (string[] memory keys, LibTypes.SchemaValue[] memory values);

  function getID() public pure virtual returns (uint256);

  function set(uint256 entity, bytes memory value) public onlyContractOwner {
    // Store the entity
    entities.add(entity);

    // Remove the entitiy from the previous reverse mapping if there is one
    valueToEntities.remove(uint256(keccak256(entityToValue[entity])), entity);

    // Store the entity's value;
    entityToValue[entity] = value;

    // Add the entity to the new reverse mapping
    valueToEntities.add(uint256(keccak256(value)), entity);

    for (uint256 i = 0; i < indexers.length; i++) {
      indexers[i].update(entity, value);
    }

    // Emit global event
    IWorld(world).registerComponentValueSet(address(this), entity, value);
  }

  function remove(uint256 entity) public onlyContractOwner {
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
    IWorld(world).registerComponentValueRemoved(address(this), entity);
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
    // Return all entities with this component value
    return valueToEntities.getItems(uint256(keccak256(value)));
  }

  function registerIndexer(address indexer) external onlyContractOwner {
    require(
      ERC165Checker.supportsInterface(indexer, type(IEntityIndexer).interfaceId),
      "Given address is not an indexer."
    );
    indexers.push(IEntityIndexer(indexer));
  }
}
