# Introduction

MUD is a framework for Ethereum applications. At its core are a set of contract interfaces and conventions for how to use them. These core interfaces and libraries enable a broad set of peripheral tools, integrations, and libraries, to make the development of on-chain applications more streamlined.

### Entity Component System

MUD is inspired by a software development pattern called "Entity Component System". In this pattern, state is strictly separated from logic - state lives in _Components_, while logic lives in _Systems_.

You can think of components as tables: columns represent the component's schema, while rows represent pieces of data stored in the table.
Each row has an ID, which we call _Entity_.
The same ID may appear in different tables, corresponding to multiple data packets being associated with the same Entity.
Systems contain the application's logic and read and modify state stored in components.

<!-- TODO: visualization of component as table -->

If you're familiar with Solidity, you might have used a variant of this pattern already without noticing.
Let's take ERC-20 contracts as an example:
ERC-20 contracts store the token balance of each address in a mapping (from `address` to `uint256` balance).
You can think of each ERC-20 contract as a table with two columns: "Address" and "Balance".
This corresponds to a component with a single schema value ("Balance").
Each row in the table associates an entity ("Address") with a component value ("Balance").
An address can hold balances in many independent ERC-20 contracts - corresponding to an entity being associated with many independent component values.
In current ERC-20 reference implementations, state and logic are coupled in the same contract.
In ECS we'd have a general "Transfer system" handling the logic of transferring tokens from one address to another by modifying the state stored in the token's components.

Another example could be a simple video game where available components are "Position" and "Health".
Entities with a position have an entry in the Position component, and entities with Health have an entry in the Health component.
A "Move system" could implement the rules of moving entities from one position to another, and a "Combat system" could implement combat logic based on rules involving the entity's position and modify the entities' health values.

## SOLECS

SOLECS is MUD's core Solidity library with interfaces and reference implementations for on-chain components, systems and more.

In SOLECS all state is stored in components.
Components are contracts implementing the [`IComponent`](https://github.com/latticexyz/mud/blob/main/packages/solecs/src/interfaces/IComponent.sol) interface.
In the base component contract all state is stored as raw bytes (to allow for a common schema for all types of components).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IERC173 } from "./IERC173.sol";
import { LibTypes } from "../LibTypes.sol";

interface IComponent is IERC173 {
  function getSchema() external pure returns (string[] memory keys, LibTypes.SchemaValue[] memory values);

  function set(uint256 entity, bytes memory value) external;

  function remove(uint256 entity) external;

  function has(uint256 entity) external view returns (bool);

  function getRawValue(uint256 entity) external view returns (bytes memory);

  function getEntities() external view returns (uint256[] memory);

  function getEntitiesWithValue(bytes memory value) external view returns (uint256[] memory);

  function authorizeWriter(address writer) external;

  function unauthorizeWriter(address writer) external;

  function world() external view returns (address);
}

```

The base component implementation is extended by the typed component contracts, adding typed functions to set and get component values, for a more streamlined development process.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IComponent } from "./IComponent.sol";

interface IUint256Component is IComponent {
  function set(uint256 entity, uint256 value) external;

  function getValue(uint256 entity) external view returns (uint256);

  function getEntitiesWithValue(uint256 value) external view returns (uint256[] memory);
}

```

Components don't contain any logic besides the logic required to store and load component values.
All application logic lives in systems, which don't contain any persistent state but work with state stored in components.

All systems can read from all components, but need write access to write to components.
(Write access is managed by a component's owner via the component's `authorizeWriter` and `unauthorizeWriter` functions.)

Note how multiple systems can share the same state and how there is no requirement for the systems and components to be deployed by the same developer.

At the center of every MUD application is the World contract.
The World is a global namespace, in which components and systems are registered with a fixed id.
The World contract is permissionless - anyone can register additional components and systems.
This is the most notable difference between this architecture and existing ones like the [Diamond pattern](https://eips.ethereum.org/EIPS/eip-2535).
It is possible because state is encapsulated in separate components contracts with individual write access.

When a component value is changed, the update is registered on the World contract (via `registerComponentValueSet`).
This causes the World contract to emit an event (`ComponentValueSet`), which can be used by clients and indexers to mirror the entire World state.

## Network

Because all state is stored in components, and all state updates are registered in the central World contract, MUD can provide the networking logic necessary to synchronize contract and client state out of the box.

The `@latticexyz/network` package contains the TypeScript implementation of this networking logic.

It takes care of loading the initial contract state when starting the client, and keeping the client state up to date by listening to `ComponentValueSet` events.

To do this it automatically creates decoder functions based on components' on-chain schema (`getSchema`) to decode the raw byte-encoded events emitted by the World.

Indexers are not strictly necessary for a client to mirror the contract state, but the loading process can be sped up and RPC calls can be reduced by using one.

The `@latticexyz/services` packages contains general-purpose indexers that synchronize the on-chain state using the same approach as described above.
If an indexer is provided, the `@latticexyz/network` will use it to load the initial client state faster and keep the local state up-to-date without calling an RPC node.
[Setting up an indexer is easy and described here](https://mud.dev/packages/services/#getting-started).

## RECS

RECS is a reactive ECS library implemented in TypeScript.
It can be used independently from any on-chain components, but also in symbiosis with SOLECS to mirror the on-chain state in the same format on the client.
With `setupMUDNetwork` from the `@latticexyz/std-client` package, local RECS components can be linked to on-chain SOLECS components to synchronize their state.

```typescript
// From https://github.com/latticexyz/mud-template-minimal/blob/main/packages/client/src/index.ts
import { setupMUDNetwork, defineNumberComponent } from "@latticexyz/std-client";
import { createWorld } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { config } from "./config";

const world = createWorld();

const components = {
  Counter: defineNumberComponent(world, {
    metadata: {
      // MUD will synchronize the local component with the
      // on chain component with id `keccak256("component.Counter")`.
      contractId: "component.Counter",
    },
  }),
};

const network = await setupMUDNetwork<typeof components, SystemTypes>(config, world, components, SystemAbis);
```

Note: the on-chain component is always considered the ground truth.
Setting a value on-chain will also update the local component, but setting a local value won't automatically update the on-chain value.
Instead, the client should call an on-chain system, which modifies the on-chain component and thereby triggers an update of the local component.

RECS supports queries and reactive systems to execute logic on (on-chain or local) state changes.

```typescript
// Query for all entities with Counter component
const query = defineQuery([Has(Counter)]);
console.log("Entities with Counter:", query.matching);

// The query result includes a stream emitting new results
query.update$.subscribe((update) => console.log("Counter update:", update));

// Systems can react to query updates too (and much more, see RECS docs)
defineSystem(world, [Has(Counter)], (update) => {
  console.log("Counter update:", update);
});
```

## Further reading

MUD contains a few other packages besides the ones mentioned in this overview (SOLECS, Network, Services, RECS):

- `cli`: The MUD command line interface contains scripts to make the life of developers easier when working with MUD - scaffolding new projects, managing the development environment, contract hot reloading, contract deployment, type generation, etc.
- `ecs-browser`: A data explorer to visualize and edit on-chain and local component values - made possible by storing state in a standardized and introspectable way.
- `std-contracts`/`std-client`: MUD standard libraries for contract and client development.

Now that you have a basic understanding of the core of MUD and the principles behind it, let's dive into a MUD project.
