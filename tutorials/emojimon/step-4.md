# 4. Optimistic rendering

Now that we can move with the keyboard, our player feels a little laggy. We can add optimistic rendering to improve the perceived performance.

## Enable position overrides

First, we need to wrap our `Position` component with `overridableComponent`. This lets us apply client-only updates to the component's values.

```ts !#3,11-14,25 packages/client/src/mud/setup.ts
import { world } from "./world";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { EntityID, overridableComponent } from "@latticexyz/recs";
import { GodID as singletonEntityId } from "@latticexyz/network";
…
export const setup = async () => {
  …
  const playerEntityId = address as EntityID;
  const playerEntity = world.registerEntity({ id: playerEntityId });

  // Add support for optimistic rendering
  const componentsWithOverrides = {
    Position: overridableComponent(components.Position),
  };

  return {
    ...result,
    world,
    singletonEntityId,
    singletonEntity,
    playerEntityId,
    playerEntity,
    components: {
      ...result.components,
      ...componentsWithOverrides,
      ...clientComponents,
    },
  };
};
```

## Override position value

Then we can override the position value before we call the move system and then remove the override once the transaction completes (or fails). The override needs a unique ID that we can refer to it by, and MUD provides a `uuid` utility for that.

```tsx !#3,10-21 packages/client/src/GameBoard.tsx
import { useEffect } from "react";
import { useComponentValueStream } from "@latticexyz/std-client";
import { uuid } from "@latticexyz/utils";
import { useMUD } from "./MUDContext";

export const GameBoard = () => {
  …
  useEffect(() => {
    const moveTo = async (x: number, y: number) => {
      const positionId = uuid();
      Position.addOverride(positionId, {
        entity: playerEntity,
        value: { x, y },
      });

      try {
        const tx = await systems["system.Move"].executeTyped({ x, y });
        await tx.wait();
      } finally {
        Position.removeOverride(positionId);
      }
    };

    const moveBy = async (deltaX: number, deltaY: number) => {
```

Wow, isn't that so much snappier? It hardly feels like a blockchain game anymore.
