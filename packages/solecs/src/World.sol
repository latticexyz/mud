// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Set } from "./Set.sol";
import { LibQuery } from "./LibQuery.sol";
import { IWorld, WorldQueryFragment } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";
import { QueryFragment } from "./interfaces/Query.sol";

contract World is IWorld {
  Set private entities = new Set();

  /// @notice This is a mapping from Component ID to the address of a deployed component connected to this world with that id
  mapping(uint256 => address) private components;
  mapping(address => uint256) private componentAddressToId;

  event ComponentRegistered(uint256 indexed componentId, address component);
  event ComponentValueSet(uint256 indexed componentId, address indexed component, uint256 indexed entity, bytes data);
  event ComponentValueRemoved(uint256 indexed componentId, address indexed component, uint256 indexed entity);

  function registerComponent(address componentAddr, uint256 id) public {
    require(id != 0, "Invalid ID");
    require(componentAddr != address(0), "Invalid component address");
    require(components[id] == address(0), "ID already registered");
    components[id] = componentAddr;
    componentAddressToId[componentAddr] = id;
    emit ComponentRegistered(id, componentAddr);
  }

  function getComponent(uint256 id) public view returns (address) {
    require(components[id] != address(0), "Component hasn't been registered");
    return components[id];
  }

  function getComponentIdFromAddress(address componentAddr) public view returns (uint256) {
    require(componentAddressToId[componentAddr] != 0, "Component hasn't been registered");
    return componentAddressToId[componentAddr];
  }

  modifier requireComponentRegistered(address component) {
    require(componentAddressToId[component] != 0, "Component hasn't been registered");
    _;
  }

  function registerComponentValueSet(
    address component,
    uint256 entity,
    bytes calldata data
  ) public requireComponentRegistered(component) {
    Set(entities).add(entity);
    emit ComponentValueSet(componentAddressToId[component], component, entity, data);
  }

  function registerComponentValueRemoved(address component, uint256 entity)
    public
    requireComponentRegistered(component)
  {
    emit ComponentValueRemoved(componentAddressToId[component], component, entity);
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
}
