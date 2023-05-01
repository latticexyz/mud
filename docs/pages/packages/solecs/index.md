# Solidity API

## BareComponent

Components are a key-value store from entity id to component value.
They are registered in the World and register updates to their state in the World.
They have an owner, who can grant write access to more addresses.
(Systems that want to write to a component need to be given write access first.)
Everyone has read access.

### BareComponent\_\_NotImplemented

```solidity
error BareComponent__NotImplemented()
```

### world

```solidity
address world
```

Reference to the World contract this component is registered in

### entityToValue

```solidity
mapping(uint256 => bytes) entityToValue
```

Mapping from entity id to value in this component

### id

```solidity
uint256 id
```

Public identifier of this component

### constructor

```solidity
constructor(address _world, uint256 _id) internal
```

### registerWorld

```solidity
function registerWorld(address _world) public
```

Register this component in the given world.

| Name    | Type    | Description                    |
| ------- | ------- | ------------------------------ |
| \_world | address | Address of the World contract. |

### set

```solidity
function set(uint256 entity, bytes value) public
```

Set the given component value for the given entity.
Registers the update in the World contract.
Can only be called by addresses with write access to this component.

| Name   | Type    | Description                        |
| ------ | ------- | ---------------------------------- |
| entity | uint256 | Entity to set the value for.       |
| value  | bytes   | Value to set for the given entity. |

### remove

```solidity
function remove(uint256 entity) public
```

Remove the given entity from this component.
Registers the update in the World contract.
Can only be called by addresses with write access to this component.

| Name   | Type    | Description                           |
| ------ | ------- | ------------------------------------- |
| entity | uint256 | Entity to remove from this component. |

### has

```solidity
function has(uint256 entity) public view virtual returns (bool)
```

Check whether the given entity has a value in this component.

| Name   | Type    | Description                                                   |
| ------ | ------- | ------------------------------------------------------------- |
| entity | uint256 | Entity to check whether it has a value in this component for. |

### getRawValue

```solidity
function getRawValue(uint256 entity) public view virtual returns (bytes)
```

Get the raw (abi-encoded) value of the given entity in this component.

| Name   | Type    | Description                                        |
| ------ | ------- | -------------------------------------------------- |
| entity | uint256 | Entity to get the raw value in this component for. |

### getEntities

```solidity
function getEntities() public view virtual returns (uint256[])
```

Not implemented in BareComponent

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(bytes) public view virtual returns (uint256[])
```

Not implemented in BareComponent

### registerIndexer

```solidity
function registerIndexer(address) external virtual
```

Not implemented in BareComponent

### \_set

```solidity
function _set(uint256 entity, bytes value) internal virtual
```

Set the given component value for the given entity.
Registers the update in the World contract.
Can only be called internally (by the component or contracts deriving from it),
without requiring explicit write access.

| Name   | Type    | Description                        |
| ------ | ------- | ---------------------------------- |
| entity | uint256 | Entity to set the value for.       |
| value  | bytes   | Value to set for the given entity. |

### \_remove

```solidity
function _remove(uint256 entity) internal virtual
```

Remove the given entity from this component.
Registers the update in the World contract.
Can only be called internally (by the component or contracts deriving from it),
without requiring explicit write access.

| Name   | Type    | Description                           |
| ------ | ------- | ------------------------------------- |
| entity | uint256 | Entity to remove from this component. |

## Component

Components are a key-value store from entity id to component value.
They are registered in the World and register updates to their state in the World.
They have an owner, who can grant write access to more addresses.
(Systems that want to write to a component need to be given write access first.)
Everyone has read access.

### entities

```solidity
contract Set entities
```

Set of entities with values in this component

### valueToEntities

```solidity
contract MapSet valueToEntities
```

Reverse mapping from value to set of entities

### indexers

```solidity
contract IEntityIndexer[] indexers
```

List of indexers to be updated when a component value changes

### constructor

```solidity
constructor(address _world, uint256 _id) internal
```

### has

```solidity
function has(uint256 entity) public view virtual returns (bool)
```

Check whether the given entity has a value in this component.

| Name   | Type    | Description                                                   |
| ------ | ------- | ------------------------------------------------------------- |
| entity | uint256 | Entity to check whether it has a value in this component for. |

### getEntities

```solidity
function getEntities() public view virtual returns (uint256[])
```

Get a list of all entities that have a value in this component.

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(bytes value) public view virtual returns (uint256[])
```

Get a list of all entities that have the specified value in this component.

| Name  | Type  | Description                                                        |
| ----- | ----- | ------------------------------------------------------------------ |
| value | bytes | Abi-encoded value to get the list of entities with this value for. |

### registerIndexer

```solidity
function registerIndexer(address indexer) external virtual
```

Register a new indexer that gets notified when a component value is set.

| Name    | Type    | Description                                                     |
| ------- | ------- | --------------------------------------------------------------- |
| indexer | address | Address of the indexer to notify when a component value is set. |

### \_set

```solidity
function _set(uint256 entity, bytes value) internal virtual
```

Set the given component value for the given entity.
Registers the update in the World contract.
Can only be called internally (by the component or contracts deriving from it),
without requiring explicit write access.

| Name   | Type    | Description                        |
| ------ | ------- | ---------------------------------- |
| entity | uint256 | Entity to set the value for.       |
| value  | bytes   | Value to set for the given entity. |

### \_remove

```solidity
function _remove(uint256 entity) internal virtual
```

Remove the given entity from this component.
Registers the update in the World contract.
Can only be called internally (by the component or contracts deriving from it),
without requiring explicit write access.

| Name   | Type    | Description                           |
| ------ | ------- | ------------------------------------- |
| entity | uint256 | Entity to remove from this component. |

## Indexer

### entities

```solidity
contract Set entities
```

### valueToEntities

```solidity
mapping(bytes => address) valueToEntities
```

### entityToValue

```solidity
mapping(uint256 => bytes) entityToValue
```

### components

```solidity
contract Component[] components
```

### trackValueForComponent

```solidity
bool[] trackValueForComponent
```

### constructor

```solidity
constructor(contract Component[] _components, bool[] _trackValueForComponent) public
```

### update

```solidity
function update(uint256 entity, bytes value) external
```

### remove

```solidity
function remove(uint256 entity) external
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

query whether contract has registered support for given interface

| Name        | Type   | Description  |
| ----------- | ------ | ------------ |
| interfaceId | bytes4 | interface id |

| Name | Type | Description                         |
| ---- | ---- | ----------------------------------- |
| [0]  | bool | bool whether interface is supported |

### getEntities

```solidity
function getEntities() external view returns (uint256[])
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(bytes value) external view returns (uint256[])
```

### has

```solidity
function has(uint256 entity) public view returns (bool)
```

### \_set

```solidity
function _set(uint256 entity, bytes[] newValues) internal
```

## Uint256Node

```solidity
struct Uint256Node {
  uint256 value;
  uint256 next;
}
```

## freeFunction

```solidity
freeFunction pointer(struct Uint256Node a) internal pure returns (bytes32 ptr)
```

## freeFunction

```solidity
freeFunction fromPointer(bytes32 ptr) internal pure returns (struct Uint256Node a)
```

## freeFunction

```solidity
freeFunction isPositiveFragment(struct QueryFragment fragment) internal pure returns (bool)
```

## freeFunction

```solidity
freeFunction isNegativeFragment(struct QueryFragment fragment) internal pure returns (bool)
```

## freeFunction

```solidity
freeFunction isSettingFragment(struct QueryFragment fragment) internal pure returns (bool)
```

## freeFunction

```solidity
freeFunction isEntityFragment(struct QueryFragment fragment) internal pure returns (bool)
```

## freeFunction

```solidity
freeFunction passesQueryFragment(uint256 entity, struct QueryFragment fragment) internal view returns (bool)
```

## freeFunction

```solidity
freeFunction passesQueryFragmentProxy(uint256 entity, struct QueryFragment fragment, struct QueryFragment proxyRead) internal view returns (bool passes, bool proxyFound)
```

## freeFunction

```solidity
freeFunction isBreakingPassState(bool passes, struct QueryFragment fragment) internal pure returns (bool)
```

For positive fragments (Has/HasValue) we need to find any passing entity up the proxy chain
so as soon as passes is true, we can early return. For negative fragments (Not/NotValue) every entity
up the proxy chain must pass, so we can early return if we find one that doesn't pass.

## QueryVars

```solidity
struct QueryVars {
  LinkedList entities;
  uint256 numEntities;
  struct QueryFragment proxyRead;
  struct QueryFragment proxyExpand;
  bool initialFragment;
}
```

## LibQuery

### query

```solidity
function query(struct QueryFragment[] fragments) internal view returns (uint256[])
```

Execute the given query and return a list of entity ids

| Name      | Type                   | Description                        |
| --------- | ---------------------- | ---------------------------------- |
| fragments | struct QueryFragment[] | List of query fragments to execute |

| Name | Type      | Description                                  |
| ---- | --------- | -------------------------------------------- |
| [0]  | uint256[] | entities List of entities matching the query |

### \_processProxyRead

```solidity
function _processProxyRead(struct QueryVars v, struct QueryFragment fragment, uint256 entity, bool passes) internal view returns (bool)
```

### \_processProxyExpand

```solidity
function _processProxyExpand(struct QueryVars v, struct QueryFragment fragment, uint256 entity, LinkedList nextEntities, uint256 nextNumEntities) internal view returns (LinkedList, uint256)
```

### getChildEntities

```solidity
function getChildEntities(uint256 entity, contract IComponent component, uint256 depth) internal view returns (uint256[])
```

Recursively computes all direct and indirect child entities up to the specified depth

| Name      | Type                | Description                                                |
| --------- | ------------------- | ---------------------------------------------------------- |
| entity    | uint256             | Entity to get all child entities up to the specified depth |
| component | contract IComponent | Entity reference component                                 |
| depth     | uint256             | Depth up to which the recursion should be applied          |

| Name | Type      | Description                                                                         |
| ---- | --------- | ----------------------------------------------------------------------------------- |
| [0]  | uint256[] | Set of entities that are child entities of the given entity via the given component |

### getValueWithProxy

```solidity
function getValueWithProxy(contract IComponent component, uint256 entity, contract IComponent proxyComponent, uint256 depth) internal view returns (bytes value, bool found)
```

### listToArray

```solidity
function listToArray(LinkedList list, uint256 length) public pure returns (uint256[] array)
```

Helper function to turn a linked list into an array

### arrayToList

```solidity
function arrayToList(uint256[] array) public pure returns (LinkedList list)
```

Helper function to turn an array into a linked list

## LibTypes

Enum of supported schema types

### SchemaValue

```solidity
enum SchemaValue {
  BOOL,
  INT8,
  INT16,
  INT32,
  INT64,
  INT128,
  INT256,
  INT,
  UINT8,
  UINT16,
  UINT32,
  UINT64,
  UINT128,
  UINT256,
  BYTES,
  STRING,
  ADDRESS,
  BYTES4,
  BOOL_ARRAY,
  INT8_ARRAY,
  INT16_ARRAY,
  INT32_ARRAY,
  INT64_ARRAY,
  INT128_ARRAY,
  INT256_ARRAY,
  INT_ARRAY,
  UINT8_ARRAY,
  UINT16_ARRAY,
  UINT32_ARRAY,
  UINT64_ARRAY,
  UINT128_ARRAY,
  UINT256_ARRAY,
  BYTES_ARRAY,
  STRING_ARRAY
}
```

## MapSet

Key value store with uint256 key and uint256 Set value

### items

```solidity
mapping(uint256 => uint256[]) items
```

### itemToIndex

```solidity
mapping(uint256 => mapping(uint256 => uint256)) itemToIndex
```

### add

```solidity
function add(uint256 setKey, uint256 item) public
```

### remove

```solidity
function remove(uint256 setKey, uint256 item) public
```

### has

```solidity
function has(uint256 setKey, uint256 item) public view returns (bool)
```

### getItems

```solidity
function getItems(uint256 setKey) public view returns (uint256[])
```

### size

```solidity
function size(uint256 setKey) public view returns (uint256)
```

## Ownable

IERC173 implementation

### constructor

```solidity
constructor() public
```

## OwnableWritable

Ownable with authorized writers

### OwnableWritable\_\_NotWriter

```solidity
error OwnableWritable__NotWriter()
```

### writeAccess

```solidity
function writeAccess(address operator) public view virtual returns (bool)
```

Whether given operator has write access

### onlyWriter

```solidity
modifier onlyWriter()
```

Revert if caller does not have write access to this component

### authorizeWriter

```solidity
function authorizeWriter(address writer) public virtual
```

Grant write access to the given address.
Can only be called by the owner.

| Name   | Type    | Description                       |
| ------ | ------- | --------------------------------- |
| writer | address | Address to grant write access to. |

### unauthorizeWriter

```solidity
function unauthorizeWriter(address writer) public virtual
```

Revoke write access from the given address.
Can only be called by the owner.

| Name   | Type    | Description                     |
| ------ | ------- | ------------------------------- |
| writer | address | Address to revoke write access. |

## OwnableWritableStorage

### Layout

```solidity
struct Layout {
  mapping(address => bool) writeAccess;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

### layout

```solidity
function layout() internal pure returns (struct OwnableWritableStorage.Layout l)
```

## PayableSystem

System base contract

### components

```solidity
contract IUint256Component components
```

### world

```solidity
contract IWorld world
```

### constructor

```solidity
constructor(contract IWorld _world, address _components) internal
```

## Set

Set of unique uint256

### items

```solidity
uint256[] items
```

### itemToIndex

```solidity
mapping(uint256 => uint256) itemToIndex
```

### add

```solidity
function add(uint256 item) public
```

### remove

```solidity
function remove(uint256 item) public
```

### getIndex

```solidity
function getIndex(uint256 item) public view returns (bool, uint256)
```

### has

```solidity
function has(uint256 item) public view returns (bool)
```

### getItems

```solidity
function getItems() public view returns (uint256[])
```

### size

```solidity
function size() public view returns (uint256)
```

## System

System base contract

### components

```solidity
contract IUint256Component components
```

### world

```solidity
contract IWorld world
```

### constructor

```solidity
constructor(contract IWorld _world, address _components) internal
```

## SystemStorage

Systems contain the address of the components registry and world contract as state variables.
SystemStorage ensures that these addresses are stored at deterministic locations in a System contract's storage.
Developers can read/write components and access world utilities from any library called by a System.
Warning: Library must be initialized (init) by a contract that can access components + world contracts before use.
The intialization is done automatically for any contract inheriting System or MudTest.

### Layout

```solidity
struct Layout {
  contract IUint256Component components;
  contract IWorld world;
}
```

### STORAGE_SLOT

```solidity
bytes32 STORAGE_SLOT
```

Location in memory where the Layout struct will be stored

### layout

```solidity
function layout() internal pure returns (struct SystemStorage.Layout l)
```

Utility for accessing the STORAGE_SLOT location in the contract's storage

| Name | Type                        | Description                         |
| ---- | --------------------------- | ----------------------------------- |
| l    | struct SystemStorage.Layout | Layout struct at storage position l |

### init

```solidity
function init(contract IWorld _world, contract IUint256Component _components) internal
```

Register this component in the given world.

_This function must be called at the start of any contract that expects libraries to access SystemStorage!_

| Name         | Type                       | Description                                  |
| ------------ | -------------------------- | -------------------------------------------- |
| \_world      | contract IWorld            | Address of the World contract.               |
| \_components | contract IUint256Component | Address of the Components registry contract. |

### components

```solidity
function components() public view returns (contract IUint256Component)
```

| Name | Type                       | Description                 |
| ---- | -------------------------- | --------------------------- |
| [0]  | contract IUint256Component | Component registry contract |

### world

```solidity
function world() public view returns (contract IWorld)
```

| Name | Type            | Description    |
| ---- | --------------- | -------------- |
| [0]  | contract IWorld | World contract |

### system

```solidity
function system(uint256 systemID) internal view returns (address)
```

| Name     | Type    | Description     |
| -------- | ------- | --------------- |
| systemID | uint256 | ID for a system |

| Name | Type    | Description                                                 |
| ---- | ------- | ----------------------------------------------------------- |
| [0]  | address | address of the System contract from the components registry |

### component

```solidity
function component(uint256 componentID) internal view returns (address)
```

| Name        | Type    | Description        |
| ----------- | ------- | ------------------ |
| componentID | uint256 | ID for a component |

| Name | Type    | Description                                                    |
| ---- | ------- | -------------------------------------------------------------- |
| [0]  | address | address of the Component contract from the components registry |

## World

The `World` contract is at the core of every on-chain world.
Entities, components and systems are registered in the `World`.
Components register updates to their state via the `registerComponentValueSet`
and `registerComponentValueRemoved` methods, which emit the `ComponentValueSet` and `ComponentValueRemoved` events respectively.

Clients can reconstruct the entire state (of all components) by listening to
these two events, instead of having to add a separate getter or event listener
for every type of data. (Have a look at the MUD network package for a TypeScript
implementation of contract/client state sync.)

The `World` is an ownerless and permissionless contract.
Anyone can register new components and systems in the world (via the `registerComponent` and `registerSystem` methods).
Clients decide which components and systems they care about.

### entities

```solidity
contract Set entities
```

### \_components

```solidity
contract Uint256Component _components
```

### \_systems

```solidity
contract Uint256Component _systems
```

### register

```solidity
contract RegisterSystem register
```

### ComponentValueSet

```solidity
event ComponentValueSet(uint256 componentId, address component, uint256 entity, bytes data)
```

### ComponentValueRemoved

```solidity
event ComponentValueRemoved(uint256 componentId, address component, uint256 entity)
```

### constructor

```solidity
constructor() public
```

### init

```solidity
function init() public
```

Initialize the World.
Separated from the constructor to prevent circular dependencies.

### components

```solidity
function components() public view returns (contract IUint256Component)
```

Get the component registry Uint256Component
(mapping from component address to component id)

### systems

```solidity
function systems() public view returns (contract IUint256Component)
```

Get the system registry Uint256Component
(mapping from system address to system id)

### registerComponent

```solidity
function registerComponent(address componentAddr, uint256 id) public
```

Register a new component in this World.
ID must be unique.

### registerSystem

```solidity
function registerSystem(address systemAddr, uint256 id) public
```

Register a new system in this World.
ID must be unique.

### requireComponentRegistered

```solidity
modifier requireComponentRegistered(address component)
```

Reverts if the component is not registered in this World.

### registerComponentValueSet

```solidity
function registerComponentValueSet(address component, uint256 entity, bytes data) public
```

Deprecated - use registerComponentValueSet(entity, data) instead
Register a component value update.
Emits the `ComponentValueSet` event for clients to reconstruct the state.

### registerComponentValueSet

```solidity
function registerComponentValueSet(uint256 entity, bytes data) public
```

Register a component value update.
Emits the `ComponentValueSet` event for clients to reconstruct the state.

### registerComponentValueRemoved

```solidity
function registerComponentValueRemoved(address component, uint256 entity) public
```

Deprecated - use registerComponentValueRemoved(entity) instead
Register a component value removal.
Emits the `ComponentValueRemoved` event for clients to reconstruct the state.

### registerComponentValueRemoved

```solidity
function registerComponentValueRemoved(uint256 entity) public
```

Register a component value removal.
Emits the `ComponentValueRemoved` event for clients to reconstruct the state.

### getComponent

```solidity
function getComponent(uint256 id) external view returns (address)
```

Deprecated, but left here for backward compatibility. TODO: refactor all consumers.

### getComponentIdFromAddress

```solidity
function getComponentIdFromAddress(address componentAddr) external view returns (uint256)
```

Deprecated, but left here for backward compatibility. TODO: refactor all consumers.

### getSystemAddress

```solidity
function getSystemAddress(uint256 systemId) external view returns (address)
```

Deprecated, but left here for backward compatibility. TODO: refactor all consumers.

### getNumEntities

```solidity
function getNumEntities() public view returns (uint256)
```

### query

```solidity
function query(struct WorldQueryFragment[] worldQueryFragments) public view returns (uint256[])
```

Helper function to execute a query with query fragments referring to a component ID instead of a component address.

### hasEntity

```solidity
function hasEntity(uint256 entity) public view returns (bool)
```

Check whether an entity exists in this world.

### getUniqueEntityId

```solidity
function getUniqueEntityId() public view returns (uint256)
```

Get a new unique entity ID.

## Uint256Component

Reference implementation of a component storing a uint256 value for each entity.

### constructor

```solidity
constructor(address world, uint256 id) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, uint256 value) public virtual
```

### getValue

```solidity
function getValue(uint256 entity) public view virtual returns (uint256)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(uint256 value) public view virtual returns (uint256[])
```

## componentsComponentId

```solidity
uint256 componentsComponentId
```

## systemsComponentId

```solidity
uint256 systemsComponentId
```

## IComponent

### getSchema

```solidity
function getSchema() external pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, bytes value) external
```

### remove

```solidity
function remove(uint256 entity) external
```

### has

```solidity
function has(uint256 entity) external view returns (bool)
```

### getRawValue

```solidity
function getRawValue(uint256 entity) external view returns (bytes)
```

### getEntities

```solidity
function getEntities() external view returns (uint256[])
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(bytes value) external view returns (uint256[])
```

### registerIndexer

```solidity
function registerIndexer(address indexer) external
```

### world

```solidity
function world() external view returns (address)
```

## IEntityContainer

### has

```solidity
function has(uint256 entity) external view returns (bool)
```

### getEntities

```solidity
function getEntities() external view returns (uint256[])
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(bytes value) external view returns (uint256[])
```

## IEntityIndexer

### update

```solidity
function update(uint256 entity, bytes value) external
```

### remove

```solidity
function remove(uint256 entity) external
```

## IOwnableWritable

### authorizeWriter

```solidity
function authorizeWriter(address writer) external
```

### unauthorizeWriter

```solidity
function unauthorizeWriter(address writer) external
```

## IPayableSystem

### execute

```solidity
function execute(bytes args) external payable returns (bytes)
```

## ISystem

### execute

```solidity
function execute(bytes args) external returns (bytes)
```

## IUint256Component

### set

```solidity
function set(uint256 entity, uint256 value) external
```

### getValue

```solidity
function getValue(uint256 entity) external view returns (uint256)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(uint256 value) external view returns (uint256[])
```

## WorldQueryFragment

```solidity
struct WorldQueryFragment {
  enum QueryType queryType;
  uint256 componentId;
  bytes value;
}
```

## IWorld

### components

```solidity
function components() external view returns (contract IUint256Component)
```

### systems

```solidity
function systems() external view returns (contract IUint256Component)
```

### registerComponent

```solidity
function registerComponent(address componentAddr, uint256 id) external
```

### getComponent

```solidity
function getComponent(uint256 id) external view returns (address)
```

### getComponentIdFromAddress

```solidity
function getComponentIdFromAddress(address componentAddr) external view returns (uint256)
```

### registerSystem

```solidity
function registerSystem(address systemAddr, uint256 id) external
```

### registerComponentValueSet

```solidity
function registerComponentValueSet(address component, uint256 entity, bytes data) external
```

### registerComponentValueSet

```solidity
function registerComponentValueSet(uint256 entity, bytes data) external
```

### registerComponentValueRemoved

```solidity
function registerComponentValueRemoved(address component, uint256 entity) external
```

### registerComponentValueRemoved

```solidity
function registerComponentValueRemoved(uint256 entity) external
```

### getNumEntities

```solidity
function getNumEntities() external view returns (uint256)
```

### hasEntity

```solidity
function hasEntity(uint256 entity) external view returns (bool)
```

### getUniqueEntityId

```solidity
function getUniqueEntityId() external view returns (uint256)
```

### query

```solidity
function query(struct WorldQueryFragment[] worldQueryFragments) external view returns (uint256[])
```

### init

```solidity
function init() external
```

## QueryType

```solidity
enum QueryType {
  Has,
  Not,
  HasValue,
  NotValue,
  ProxyRead,
  ProxyExpand
}
```

## QueryFragment

```solidity
struct QueryFragment {
  enum QueryType queryType;
  contract IComponent component;
  bytes value;
}
```

## RegisterType

```solidity
enum RegisterType {
  Component,
  System
}
```

## ID

```solidity
uint256 ID
```

## RegisterSystem

### constructor

```solidity
constructor(contract IWorld _world, address _components) public
```

### requirement

```solidity
function requirement(bytes args) public view returns (bytes)
```

### execute

```solidity
function execute(address msgSender, enum RegisterType registerType, address addr, uint256 id) public returns (bytes)
```

### execute

```solidity
function execute(bytes args) public returns (bytes)
```

## ComponentTest

### vm

```solidity
contract Vm vm
```

### users

```solidity
address payable[] users
```

### component

```solidity
contract TestComponent component
```

### setUp

```solidity
function setUp() public
```

### testSetAndGetValue

```solidity
function testSetAndGetValue() public
```

### testRemove

```solidity
function testRemove() public
```

### testGetEntities

```solidity
function testGetEntities() public
```

### testGetEntitiesWithValue

```solidity
function testGetEntitiesWithValue() public
```

## IndexerTest

### vm

```solidity
contract Vm vm
```

### position

```solidity
contract PositionComponent position
```

### damage

```solidity
contract DamageComponent damage
```

### regionCreatures

```solidity
contract Indexer regionCreatures
```

### setUp

```solidity
function setUp() public
```

### testSetAndGetEntitiesWithValue

```solidity
function testSetAndGetEntitiesWithValue() public
```

### testUpdate

```solidity
function testUpdate() public
```

### testRemove

```solidity
function testRemove() public
```

### testGetEntities

```solidity
function testGetEntities() public
```

## LibQueryTest

### vm

```solidity
contract Vm vm
```

### users

```solidity
address payable[] users
```

### component1

```solidity
contract TestComponent1 component1
```

### component2

```solidity
contract TestComponent2 component2
```

### component3

```solidity
contract TestComponent3 component3
```

### prototypeTag

```solidity
contract PrototypeTagComponent prototypeTag
```

### fromPrototype

```solidity
contract FromPrototypeComponent fromPrototype
```

### ownedByEntity

```solidity
contract OwnedByEntityComponent ownedByEntity
```

### setUp

```solidity
function setUp() public
```

### testHasQuery

```solidity
function testHasQuery() public
```

### testHasValueQuery

```solidity
function testHasValueQuery() public
```

### testCombinedHasQuery

```solidity
function testCombinedHasQuery() public
```

### testCombinedHasValueQuery

```solidity
function testCombinedHasValueQuery() public
```

### testCombinedHasHasValueQuery

```solidity
function testCombinedHasHasValueQuery() public
```

### testCombinedHasNotQuery

```solidity
function testCombinedHasNotQuery() public
```

### testCombinedHasValueNotQuery

```solidity
function testCombinedHasValueNotQuery() public
```

### testCombinedHasHasValueNotQuery

```solidity
function testCombinedHasHasValueNotQuery() public
```

### testNotValueQuery

```solidity
function testNotValueQuery() public
```

### testInitialProxyExpand

```solidity
function testInitialProxyExpand() public
```

### testDeepProxyExpand

```solidity
function testDeepProxyExpand() public
```

### testProxyRead

```solidity
function testProxyRead() public
```

### testDeepProxyRead

```solidity
function testDeepProxyRead() public
```

### testGetValueWithProxy

```solidity
function testGetValueWithProxy() public
```

## SetTest

### vm

```solidity
contract Vm vm
```

### users

```solidity
address payable[] users
```

### set

```solidity
contract Set set
```

### setUp

```solidity
function setUp() public
```

### testAdd

```solidity
function testAdd() public
```

### testAddDuplicate

```solidity
function testAddDuplicate() public
```

### testRemove

```solidity
function testRemove() public
```

### testGetItems

```solidity
function testGetItems() public
```

### testSize

```solidity
function testSize() public
```

### testHas

```solidity
function testHas() public
```

## SampleSystem

### constructor

```solidity
constructor(contract IWorld _world, address _components) public
```

### execute

```solidity
function execute(bytes arguments) public returns (bytes)
```

### executeTyped

```solidity
function executeTyped() external returns (bytes)
```

### getWorld

```solidity
function getWorld() public view returns (contract IWorld)
```

### getComponents

```solidity
function getComponents() public view returns (contract IUint256Component)
```

## SystemTest

### systems

```solidity
contract IUint256Component systems
```

### world

```solidity
contract World world
```

### components

```solidity
contract IUint256Component components
```

### system

```solidity
contract SampleSystem system
```

### setUp

```solidity
function setUp() public
```

### testSystemStorage

```solidity
function testSystemStorage() public
```

### testSystemStorageTest

```solidity
function testSystemStorageTest() public
```

## WorldTest

### vm

```solidity
contract Vm vm
```

### users

```solidity
address payable[] users
```

### world

```solidity
contract World world
```

### component1

```solidity
contract TestComponent1 component1
```

### component2

```solidity
contract TestComponent2 component2
```

### component3

```solidity
contract TestComponent3 component3
```

### prototypeTag

```solidity
contract PrototypeTagComponent prototypeTag
```

### fromPrototype

```solidity
contract FromPrototypeComponent fromPrototype
```

### ownedByEntity

```solidity
contract OwnedByEntityComponent ownedByEntity
```

### setUp

```solidity
function setUp() public
```

### testQuery

```solidity
function testQuery() public
```

## ID

```solidity
uint256 ID
```

## DamageComponent

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, uint256 value) public
```

### getValue

```solidity
function getValue(uint256 entity) public view returns (uint256)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(uint256 value) public view returns (uint256[])
```

## FromPrototypeComponent

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, uint256 prototypeEntity) public
```

### getValue

```solidity
function getValue(uint256 entity) public view returns (uint256)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(uint256 prototypeEntity) public view returns (uint256[])
```

## OwnedByEntityComponent

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, uint256 ownedByEntity) public
```

### getValue

```solidity
function getValue(uint256 entity) public view returns (uint256)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(uint256 ownedByEntity) public view returns (uint256[])
```

## Position

```solidity
struct Position {
  int64 x;
  int64 y;
}
```

## ID

```solidity
uint256 ID
```

## PositionComponent

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, struct Position value) public
```

### getValue

```solidity
function getValue(uint256 entity) public view returns (struct Position)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(struct Position value) public view returns (uint256[])
```

## PrototypeTagComponent

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

### set

```solidity
function set(uint256 entity, bool value) public
```

### getValue

```solidity
function getValue(uint256 entity) public view returns (bool)
```

### getEntitiesWithValue

```solidity
function getEntitiesWithValue(bool value) public view returns (uint256[])
```

## TestComponent

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

## TestComponent1

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

## TestComponent2

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

## TestComponent3

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

## TestComponent4

### ID

```solidity
uint256 ID
```

### constructor

```solidity
constructor(address world) public
```

### getSchema

```solidity
function getSchema() public pure returns (string[] keys, enum LibTypes.SchemaValue[] values)
```

Return the keys and value types of the schema of this component.

## UtilsTest

### testSplit

```solidity
function testSplit() public
```

## freeFunction

```solidity
freeFunction entityToAddress(uint256 entity) internal pure returns (address)
```

Turn an entity ID into its corresponding Ethereum address.

## freeFunction

```solidity
freeFunction addressToEntity(address addr) internal pure returns (uint256)
```

Turn an Ethereum address into its corresponding entity ID.

## freeFunction

```solidity
freeFunction getAddressById(contract IUint256Component registry, uint256 id) internal view returns (address)
```

Get an Ethereum address from an address/id registry component (like \_components/\_systems in World.sol)

## freeFunction

```solidity
freeFunction getIdByAddress(contract IUint256Component registry, address addr) internal view returns (uint256)
```

Get an entity id from an address/id registry component (like \_components/\_systems in World.sol)

## freeFunction

```solidity
freeFunction getComponentById(contract IUint256Component components, uint256 id) internal view returns (contract IComponent)
```

Get a Component from an address/id registry component (like \_components in World.sol)

## freeFunction

```solidity
freeFunction getSystemAddressById(contract IUint256Component components, uint256 id) internal view returns (address)
```

Get the Ethereum address of a System from an address/id component registry component in which the
System registry component is registered (like \_components in World.sol)

## freeFunction

```solidity
freeFunction getSystemById(contract IUint256Component components, uint256 id) internal view returns (contract ISystem)
```

Get a System from an address/id component registry component in which the
System registry component is registered (like \_components in World.sol)

## freeFunction

```solidity
freeFunction split(bytes data, uint8[] lengths) internal pure returns (bytes[])
```

Split a single bytes blob into an array of bytes of the given length
