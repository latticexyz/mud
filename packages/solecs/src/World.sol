// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Set } from "./Set.sol";
import { LibQuery } from "./LibQuery.sol";
import { IWorld, WorldQueryFragment } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";
import { QueryFragment } from "./interfaces/Query.sol";
import { Uint256Component } from "./components/Uint256Component.sol";
import { addressToEntity, entityToAddress } from "./utils.sol";

uint256 constant componentsComponentId = uint256(keccak256("world.component.components"));

contract World is IWorld {
  Set private entities = new Set();

  /// @notice Mapping from component address (= entityId) to component id
  Uint256Component public components = new Uint256Component(address(0), componentsComponentId);

  event ComponentValueSet(uint256 indexed componentId, address indexed component, uint256 indexed entity, bytes data);
  event ComponentValueRemoved(uint256 indexed componentId, address indexed component, uint256 indexed entity);

  function init() public {
    components.registerWorld(address(this));
  }

  function registerComponent(address componentAddr, uint256 id) public {
    require(id != 0, "Invalid ID");
    require(componentAddr != address(0), "Invalid component address");
    require(!components.has(addressToEntity(componentAddr)), "Component already registered");
    require(components.getEntitiesWithValue(id).length == 0, "ID already registered");
    components.set(addressToEntity(componentAddr), id);
  }

  // TODO: this method is redundant, use a util or access components directly
  function getComponent(uint256 id) public view returns (address) {
    uint256[] memory componentEntities = components.getEntitiesWithValue(id);
    require(componentEntities.length != 0, "Component hasn't been registered");
    return entityToAddress(componentEntities[0]);
  }

  // TODO: this method is redundant, use a util or access components directly
  function getComponentIdFromAddress(address componentAddr) public view returns (uint256) {
    require(components.has(addressToEntity(componentAddr)), "Component hasn't been registered");
    return components.getValue(addressToEntity(componentAddr));
  }

  modifier requireComponentRegistered(address component) {
    require(components.has(addressToEntity(component)), "Component hasn't been registered");
    _;
  }

  function registerComponentValueSet(
    address component,
    uint256 entity,
    bytes calldata data
  ) public requireComponentRegistered(component) {
    Set(entities).add(entity);
    emit ComponentValueSet(components.getValue(addressToEntity(component)), component, entity, data);
  }

  function registerComponentValueRemoved(address component, uint256 entity)
    public
    requireComponentRegistered(component)
  {
    emit ComponentValueRemoved(components.getValue(addressToEntity(component)), component, entity);
  }

  function getNumEntities() public view returns (uint256) {
    return Set(entities).size();
  }

  function query(WorldQueryFragment[] calldata worldQueryFragments) public view returns (uint256[] memory) {
    QueryFragment[] memory fragments = new QueryFragment[](worldQueryFragments.length);
    for (uint256 i; i < worldQueryFragments.length; i++) {
      fragments[i] = QueryFragment(
        worldQueryFragments[i].queryType,
        IComponent(getComponent(worldQueryFragments[i].componentId)),
        worldQueryFragments[i].value
      );
    }
    return LibQuery.query(fragments);
  }

  function hasEntity(uint256 entity) public view returns (bool) {
    return Set(entities).has(entity);
  }

  function getUniqueEntityId() public view returns (uint256) {
    uint256 entityNum = getNumEntities();
    uint256 id;
    do {
      entityNum++;
      id = uint256(keccak256(abi.encodePacked(entityNum)));
    } while (hasEntity(id));

    return id;
  }
}
