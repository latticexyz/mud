// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Set } from "./Set.sol";
import { LibQuery } from "./LibQuery.sol";
import { IWorld, WorldQueryFragment } from "./interfaces/IWorld.sol";
import { IComponent } from "./interfaces/IComponent.sol";
import { QueryFragment } from "./interfaces/Query.sol";
import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { Uint256Component } from "./components/Uint256Component.sol";
import { addressToEntity, entityToAddress } from "./utils.sol";
import { componentsComponentId, systemsComponentId } from "./constants.sol";
import { RegisterSystem, ID as registerSystemId, RegisterType } from "./systems/RegisterSystem.sol";

contract World is IWorld {
  Set private entities = new Set();
  Uint256Component private _components;
  Uint256Component private _systems;
  RegisterSystem public register;

  event ComponentValueSet(uint256 indexed componentId, address indexed component, uint256 indexed entity, bytes data);
  event ComponentValueRemoved(uint256 indexed componentId, address indexed component, uint256 indexed entity);

  constructor() {
    _components = new Uint256Component(address(0), componentsComponentId);
    _systems = new Uint256Component(address(0), systemsComponentId);
    register = new RegisterSystem(this);
    _systems.authorizeWriter(address(register));
    _components.authorizeWriter(address(register));
  }

  function init() public {
    _components.registerWorld(address(this));
    _systems.registerWorld(address(this));
    register.execute(RegisterType.System, address(register), registerSystemId);
  }

  function components() public view returns (IUint256Component) {
    return _components;
  }

  function systems() public view returns (IUint256Component) {
    return _systems;
  }

  function registerComponent(address componentAddr, uint256 id) public {
    register.execute(RegisterType.Component, componentAddr, id);
  }

  function registerSystem(address systemAddr, uint256 id) public {
    register.execute(RegisterType.System, systemAddr, id);
  }

  modifier requireComponentRegistered(address component) {
    require(_components.has(addressToEntity(component)), "component not registered");
    _;
  }

  function registerComponentValueSet(
    address component,
    uint256 entity,
    bytes calldata data
  ) public requireComponentRegistered(component) {
    Set(entities).add(entity);
    emit ComponentValueSet(getIdByAddress(_components, component), component, entity, data);
  }

  function registerComponentValueRemoved(address component, uint256 entity)
    public
    requireComponentRegistered(component)
  {
    emit ComponentValueRemoved(getIdByAddress(_components, component), component, entity);
  }

  // Deprecated, but left here for backward compatibility. TODO: refactor all consumers.
  function getComponent(uint256 id) external view returns (address) {
    return getAddressById(_components, id);
  }

  // Deprecated, but left here for backward compatibility. TODO: refactor all consumers.
  function getComponentIdFromAddress(address componentAddr) external view returns (uint256) {
    return getIdByAddress(_components, componentAddr);
  }

  function getNumEntities() public view returns (uint256) {
    return Set(entities).size();
  }

  function query(WorldQueryFragment[] calldata worldQueryFragments) public view returns (uint256[] memory) {
    QueryFragment[] memory fragments = new QueryFragment[](worldQueryFragments.length);
    for (uint256 i; i < worldQueryFragments.length; i++) {
      fragments[i] = QueryFragment(
        worldQueryFragments[i].queryType,
        IComponent(getAddressById(_components, worldQueryFragments[i].componentId)),
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

function getAddressById(Uint256Component registry, uint256 id) view returns (address) {
  uint256[] memory entities = registry.getEntitiesWithValue(id);
  require(entities.length != 0, "id not registered");
  return entityToAddress(entities[0]);
}

function getIdByAddress(Uint256Component registry, address addr) view returns (uint256) {
  require(registry.has(addressToEntity(addr)), "address not registered");
  return registry.getValue(addressToEntity(addr));
}
