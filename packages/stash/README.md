# Stash

> [!WARNING]  
> This package is experimental and will have breaking changes while we refine its APIs and implementation. All of its exports are temporarily under `@latticexyz/stash/internal` until we consider it stable.

Stash is a client state library optimized for the MUD data model.
It uses the MUD store config to define local tables, which support writing, reading and subscribing to table updates.
It comes with a query engine optimized for ["ECS-style"](https://mud.dev/ecs) queries (similar to `@latticexyz/recs`) but with native support for composite keys.

## Getting started

### Installation

```bash
pnpm add @latticexyz/stash @latticexyz/store
```

### Example usage

```ts
import { createStash } from "@latticexyz/stash";
import { defineStore } from "@latticexyz/store";

// Define the store config
const config = defineStore(
  tables: {
    Position: {
      schema: {
        player: "address",
        x: "int32",
        y: "int32",
      },
      key: ["player"],
    },
  },
);

// Initialize stash
const stash = createStash(config);

// Write to a table
const { Position } = config.tables;
const alice = "0xc0F21fa55169feF83aC5f059ad2432a16F06dD44";
stash.setRecord({
  table: Position,
  key: {
    player: alice
  },
  value: {
    x: 1,
    y: 2
  }
});

// Read from the table
const alicePosition = stash.getRecord({ table: Position, key: { player: alice }});
//    ^? { player: "0xc0F21fa55169feF83aC5f059ad2432a16F06dD44", x: 1, y: 2 }

// Subscribe to table updates
stash.subscribeTable({
  table: Position,
  subscriber: (update) => {
    console.log("Position update", update);
  }
});

// Query the table
const players = stash.runQuery({
  query: [Matches(Position, { x: 1 })],
  options: {
    includeRecords: true
  }
})

// Subscribe to query updates
const query = stash.subscribeQuery({
  query: [Matches(Position, { x: 1 })]
})
query.subscribe((update) => {
  console.log("Query update", update);
});
```
