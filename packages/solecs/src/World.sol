// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Set } from "./Set.sol";
import { LibQuery } from "./LibQuery.sol";
import { IWorld, WorldQueryFragment } from "./interfaces/IWorld.sol";
import { QueryFragment } from "./interfaces/Query.sol";
import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { Uint256Component } from "./components/Uint256Component.sol";
import { addressToEntity, entityToAddress, getIdByAddress, getAddressById, getComponentById } from "./utils.sol";
import { componentsComponentId, systemsComponentId } from "./constants.sol";
import { RegisterSystem, ID as registerSystemId, RegisterType } from "./systems/RegisterSystem.sol";

/**
 * The `World` contract is at the core of every on-chain world.
 * Entities, components and systems are registered in the `World`.
 * Components register updates to their state via the `registerComponentValueSet`
 * and `registerComponentValueRemoved` methods, which emit the `ComponentValueSet` and `ComponentValueRemoved` events respectively.
 *
 * Clients can reconstruct the entire state (of all components) by listening to
 * these two events, instead of having to add a separate getter or event listener
 * for every type of data. (Have a look at the MUD network package for a TypeScript
 * implementation of contract/client state sync.)
 *
 * The `World` is an ownerless and permissionless contract.
 * Anyone can register new components and systems in the world (via the `registerComponent` and `registerSystem` methods).
 * Clients decide which components and systems they care about.
 */
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
    register = new RegisterSystem(this, address(_components));
    _systems.authorizeWriter(address(register));
    _components.authorizeWriter(address(register));
  }

  /**
   * Initialize the World.
   * Separated from the constructor to prevent circular dependencies.
   */
  function init() public {
    _components.registerWorld(address(this));
    _systems.registerWorld(address(this));
    register.execute(abi.encode(msg.sender, RegisterType.System, address(register), registerSystemId));
  }

  /**
   * Get the component registry Uint256Component
   * (mapping from component address to component id)
   */
  function components() public view returns (IUint256Component) {
    return _components;
  }

  /**
   * Get the system registry Uint256Component
   * (mapping from system address to system id)
   */
  function systems() public view returns (IUint256Component) {
    return _systems;
  }

  /**
   * Register a new component in this World.
   * ID must be unique.
   */
  function registerComponent(address componentAddr, uint256 id) public {
    register.execute(abi.encode(msg.sender, RegisterType.Component, componentAddr, id));
  }

  /**
   * Register a new system in this World.
   * ID must be unique.
   */
  function registerSystem(address systemAddr, uint256 id) public {
    register.execute(abi.encode(msg.sender, RegisterType.System, systemAddr, id));
  }

  /**
   * Reverts if the component is not registered in this World.
   */
  modifier requireComponentRegistered(address component) {
    require(_components.has(addressToEntity(component)), "component not registered");
    _;
  }

  /**
   * Register a component value update.
   * Emits the `ComponentValueSet` event for clients to reconstruct the state.
   */
  function registerComponentValueSet(
    address component,
    uint256 entity,
    bytes calldata data
  ) public requireComponentRegistered(component) {
    Set(entities).add(entity);
    emit ComponentValueSet(getIdByAddress(_components, component), component, entity, data);
  }

  /**
   * Register a component value removal.
   * Emits the `ComponentValueRemoved` event for clients to reconstruct the state.
   */
  function registerComponentValueRemoved(address component, uint256 entity)
    public
    requireComponentRegistered(component)
  {
    emit ComponentValueRemoved(getIdByAddress(_components, component), component, entity);
  }

  /** Deprecated, but left here for backward compatibility. TODO: refactor all consumers. */
  function getComponent(uint256 id) external view returns (address) {
    return getAddressById(_components, id);
  }

  /** Deprecated, but left here for backward compatibility. TODO: refactor all consumers. */
  function getComponentIdFromAddress(address componentAddr) external view returns (uint256) {
    return getIdByAddress(_components, componentAddr);
  }

  /** Deprecated, but left here for backward compatibility. TODO: refactor all consumers. */
  function getSystemAddress(uint256 systemId) external view returns (address) {
    return getAddressById(_systems, systemId);
  }

  function getNumEntities() public view returns (uint256) {
    return Set(entities).size();
  }

  /**
   * Helper function to execute a query with query fragments referring to a component ID instead of a component address.
   */
  function query(WorldQueryFragment[] calldata worldQueryFragments) public view returns (uint256[] memory) {
    QueryFragment[] memory fragments = new QueryFragment[](worldQueryFragments.length);
    for (uint256 i; i < worldQueryFragments.length; i++) {
      fragments[i] = QueryFragment(
        worldQueryFragments[i].queryType,
        getComponentById(_components, worldQueryFragments[i].componentId),
        worldQueryFragments[i].value
      );
    }
    return LibQuery.query(fragments);
  }

  /**
   * Check whether an entity exists in this world.
   */
  function hasEntity(uint256 entity) public view returns (bool) {
    return Set(entities).has(entity);
  }

  /**
   * Get a new unique entity ID.
   */
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
