# solecs - Solidity Entity Component System

`solecs` is a framework to build highly composable, extendable and maintainable on-chain Worlds.

It is designed around the popular Entity Component System pattern. To build some fundamental intuition about ECS, have a look at [our MUD ECS introduction](https://mud.dev/ecs).

`solecs` is seamlessly integrated with the other MUD libraries, but can be used independently.

# Features

- Fully on-chain ECS
- Powerful queries, including advanced indirect relationship queries
- Seamless integration with other MUD libraries and services
- Simple API

# Concepts

// TODO: formulate full sentences and add examples

## World

- sits at the core
- Entities, Components, Systems are registered in the world
- Component updates are emitted via an event
  - ECS state can be fully reconstructed on a client by only listening to a single stream of events, no getter methods (very expensive for RPC providers) are necessary
  - Contract / client sync only has to implemented once, with a single event (conveniently already implemented in `network`), no more implementing a separate getter / event listener for each new property on the contract
- Anyone can register components, systems in the world
- Registration of components and systems happens via a component/system -> all in ECS, all automatically synced to the clients

## Entities

- Just uint256, everything can be an entity
- Convention: addresses are entities by default (padded with 0)

## Components

- Each component in `solecs` is its own contract.
  - This allows components to be deployed independent from each other.
- Components store state (mapping from uint256 to bytes), think of components as simple key/value store
- Components expose a schema function that allows clients to automatically create decoder functions for the byte encoded values
- Component base contract implements all lower level functionality, users of the library only have to implement schema function (or use components from std-contracts)
- Reverse mapping allows efficient queries (tdb: remove reverse mapping by default and make it opt-in?)
- Components are stored in the world (in a component lol)
- Example

## Systems

- Systems are contracts with a single `execute` function
- Systems are registered on the World
- Remember that each address is an entity? So yes, systems are entities that can be stored in components
- Systems are stored in the SystemComponent in the World contract
- Example

## Queries

- Queries + Proxy queries allow more complex relationships to be represented in code
- Example

# API
