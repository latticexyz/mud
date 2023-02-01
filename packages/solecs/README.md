# solecs - Solidity Entity Component System

`solecs` is a framework to build highly composable, extendable and maintainable on-chain Worlds.

It is designed around the Entity Component System architecture pattern. To build some fundamental intuition around ECS, have a look at [our MUD ECS introduction](https://mud.dev/blog/ecs).

`solecs` is seamlessly integrated with the other MUD libraries, but can be used independently.

# Features

- Fully on-chain ECS
- Powerful queries, including advanced recursive or indirect relationship queries
- Seamless integration with other MUD libraries and services
- Simple API

# Concepts

## World

The `World` contract is at the core of every on-chain world.
Entities, components and systems are registered in the `World`.
Components register updates to their state via the `registerComponentValueSet` and `registerComponentValueRemoved` methods, which emit the `ComponentValueSet` and `ComponentValueRemoved` events respectively.
Clients can reconstruct the entire state (of all components) by listening to these two events, instead of having to add a separate getter or event listener for every type of data. (Have a look at the MUD network package for a TypeScript implementation of contract/client state sync.)

The `World` is an ownerless and permissionless contract.
Anyone can register new components and systems in the world (via the `registerComponent` and `registerSystem` methods).
Clients decide which components and systems they care about.

```solidity
interface IWorld {
  function registerComponent(address componentAddr, uint256 id) external;

  function registerSystem(address systemAddr, uint256 id) external;

  function registerComponentValueSet(
    address component,
    uint256 entity,
    bytes calldata data
  ) external;

  function registerComponentValueRemoved(address component, uint256 entity) external;

  function components() external view returns (IUint256Component);

  function systems() external view returns (IUint256Component);

  function getNumEntities() external view returns (uint256);

  function hasEntity(uint256 entity) external view returns (bool);

  function getUniqueEntityId() external view returns (uint256);

  function query(WorldQueryFragment[] calldata worldQueryFragments) external view returns (uint256[] memory);
}

```

## Entities

An entity is just a `uint256` id.
While any `uint256` is a valid id, `uint256`s from 0 to 2<sup>160</sup> are reserved for Ethereum addresses as a convention.
This allows every contract and EOA to be a valid entity.

A simple use-case of this convention is being able to represent components and systems (both of which are contracts) as entities (with their entity id being their contract address).
This allows them to be stored in "registry components" in the World, which means every component and system is automatically known to the client via the standardized contract/client sync described in the [World section](#world). Pretty meta.

## Components

Components are a key-value store from entity id to component value.
Each component is its own contract.
This allows components to be deployed independently from each other.

Components have an owner, who can grant write access to more addresses.
(Systems that want to write to a component need to be given write access first.)
Everyone has read access.

For convenience the component implementation in `solecs` also includes a reverse mapping from `keccak256(value)` to set of entities with this value, but this is not strictly required and might change in a future release.

```solidity
interface IComponent is IOwnableWritable {
  /** Return the keys and value types of the schema of this component. */
  function getSchema() external pure returns (string[] memory keys, LibTypes.SchemaValue[] memory values);

  function set(uint256 entity, bytes memory value) external;

  function remove(uint256 entity) external;

  function has(uint256 entity) external view returns (bool);

  function getRawValue(uint256 entity) external view returns (bytes memory);

  function getEntities() external view returns (uint256[] memory);

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory);

  function registerIndexer(address indexer) external;
}

```

To have a common interface, the base component contract stores values as raw bytes.
For a typed component that is easier to work with, extend the base component class and add typed `getValue`, `set` and `getEnttiiesWithValue` methods.

Example `PositionComponent.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Component } from "solecs/Component.sol";

struct Coord {
  int64 x;
  int64 y;
}

uint256 constant ID = uint256(keccak256("example.component.Position"));

contract PositionComponent is Component {
  constructor(address world) Component(world, ID) {}

  function set(uint256 entity, Coord calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Coord memory) {
    return abi.decode(getRawValue(entity), (Coord));
  }

  function getEntitiesWithValue(Coord calldata value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}

```

To allow clients to automatically create a decoder for the abi-encoded raw component value, add an optional `getSchema` method:

```
contract PositionComponent is Component {

  ...

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys[0] = "x";
    values[0] = LibTypes.SchemaValue.INT64;

    keys[1] = "y";
    values[1] = LibTypes.SchemaValue.INT64;
  }
}
```

Components are registered in the World contract and also register updates to their state in the World contract.
(This happens automatically when extending the `Component.sol` base contract).

## Systems

System are contracts with a single `execute` function.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC173.sol";

interface ISystem is IERC173 {
  function execute(bytes memory arguments) external returns (bytes memory);
}

```

For convenience adding a typed `executeTyped` method taking care of abi-encoding the arguments is recommended.

Like components, systems are registered on the World contract to allow clients to automatically sync their contract address.

In the `solecs` `System.sol` base contract, the system is initialized with a reference to the World contract and the world's component registry.
Systems have read access to every component, but need to be granted write access to components they should modify.

Example `MoveSystem.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "./PositionComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.move"));

contract MoveSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 entity, Coord memory targetPosition) = abi.decode(arguments, (uint256, Coord));

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    position.set(entity, targetPosition);
  }

  function executeTyped(uint256 entity, Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(entity, targetPosition));
  }
}

```

## Queries

Queries provide a simple API to get a list of entities matching certain specified criteria.
A query consists of a list of query fragments.
A query fragment is a struct with three fields:

```solidity
struct QueryFragment {
  QueryType queryType;
  IComponent component;
  bytes value;
}

```

Available query fragments are:

- `Has`: filter for entities that have the specified component. The `value` field in the query fragment is ignored.
- `HasValue`: filter for entities that have the specified component with the specified value.
- `Not`: filter for entities that do not have the specified component. The `value` field in th query fragment is ignored.
- `NotValue`: filter for entities that do not have the specified component with the specified value.
- `ProxyRead`: enable the proxy read mode for the rest of the query (more details below).
- `ProxyExpand`: enable the proxy expand mode for the rest of the query (more details below).

The query fragments are executed from left to right and are concatenated with a logical `AND`.
For performance reasons, the most restrictive query fragment should be first in the list of query fragments,
in order to reduce the number of entities the next query fragment needs to be checked for.
If no proxy fragments are used, every entity in the resulting set passes every query fragment.
If setting fragments are used, the order of the query fragments influences the result, since settings only apply to
fragments after the setting fragment.

Example: Query for all movable entities at position (0,0):

```solidity
QueryFragment[] memory fragments = new QueryFragment[](2);

// Specify the more restrictive filter first for performance reasons
fragments[0] = QueryFragment(QueryType.HasValue, position, abi.encode(Coord(0,0)));

// The value argument is ignored in Has query fragments
fragments[1] = QueryFragment(QueryType.Has, movable, new bytes(0));

uint256[] memory entities = LibQuery.query(fragments);
```

### Proxy queries

Proxy query fragments provide a way to query for more advanced recursive or indirect relationships.

The `ProxyRead` query fragment enables the "proxy read mode" for the rest of the query.
This means that for all remaining fragments in the query not only the entities themselves are checked, but also their "ancestors" up to the given depth (specified in the `value` field of the query fragment) on the relationship chain defined by the given `component`.
The `component` must be a `Uint256Component` (a component whose raw value decodes to a single `uint256` that points to another entity).

Example: Query for all entities that have a `position` and are (directly or indirectly) owned by an entity with `name` "Alice":

```solidity
QueryFragment[] memory fragments = new QueryFragment[](3);

fragments[0] = QueryFragment(QueryType.Has, position, new bytes(0)));
fragments[1] = QueryFragment(QueryType.ProxyRead, ownedBy, abi.encode(0xff)); // Max depth 255
fragments[2] = QueryFragment(QueryType.HasValue, name, abi.encode("Alice"));

uint256[] memory entities = LibQuery.query(fragments);
```

The `ProxyExpand` query fragment enables the "proxy expand mode" for the rest of the query.
This means that for all remaining fragments in the query not only the matching entities themselves are included in the intermediate set, but also all their "children" down to the given depth (specified in the `value` field of the query fragment) on the relationship chain define by the given `component`.
The `component` must be a `Uint256Component` (a component whose raw value decodes to a single `uint256` that points to another entity).

Example: Query for all entities (directly or indirectly) owned by an entity with `name` "Alice":

```solidity
QueryFragment[] memory fragments = new QueryFragment[](2);

fragments[0] = QueryFragment(QueryType.ProxyExpand, ownedBy, abi.encode(0xff))); // Max depth 255
fragments[1] = QueryFragment(QueryType.HasValue, name, abi.encode("Alice"));

uint256[] memory entities = LibQuery.query(fragments);
```

Proxy queries are significantly less performant (more gas intensive) than regular queries and should be used sparingly.
