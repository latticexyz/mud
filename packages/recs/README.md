# recs - Reactive Entity Component System

`recs` is built with reactivity in mind.
`Components` and `Queries` expose an `update$` stream, that `Systems` can react to.

To build some fundamental intuition about ECS, have a look at [our MUD ECS introduction](https://mud.dev/blog/ecs).

`recs` is seamlessly integrated with the other MUD libraries, but can be used independently.

For detailed documentation, check out [mud.dev/recs](https://mud.dev/recs).

# Features

- Reactive components, queries, and systems
- Powerful queries, including advanced indirect relationship queries
- Seamless integration with other MUD libraries and services
- Simple, declarative API
- Ultra high performance
- TypeScript support

# Example

```typescript
import {
  createWorld,
  defineComponent,
  createEntity,
  withValue,
  defineSystem,
  Has,
  getComponentValue,
  setComponent,
} from "@latticexyz/recs";

// Create a new World
const World = createWorld();

// Define a couple components
const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
const Movable = defineComponent(world, { speed: Type.Number });

// Create a new entity
const entity1 = createEntity(world, [withValue(Position, { x: 0, y: 0 }), withValue(Movable, { speed: 10 })]);

// Define a system that reacts to updates of movable entities with a position
defineSystem(world, [Has(Position), Has(Movable)], (update) => {
  console.log("Entity", update.entity, "moved to", update.value);
  // ... do stuff, like rendering the entity on the screen, etc
});

// Move the entity around
setInterval(() => {
  const currentPosition = getComponentValue(Position, entity1);
  const newPosition = { x: position.x + 1, y: position.y + 1 };
  setComponent(Position, entity1, newPosition);
}, 1000);
```

# Acknowledgements

- Syntax originally inspired by [bitECS](https://github.com/NateTheGreatt/bitECS)
