# 4. Optimistic rendering

Now that we can move with the keyboard, our player feels a little laggy. We can add optimistic rendering to improve the perceived performance.

## Enable position overrides

First, we need to wrap our `Position` component with `overridableComponent`. This lets us apply client-only updates to the component's values.

```ts !#1,6,12 packages/client/src/mud/components.ts
import { overridableComponent } from "@latticexyz/recs";
import { defineCoordComponent } from "@latticexyz/std-client";
import { world } from "./world";

export const contractComponents = {
  Position: overridableComponent(
    defineCoordComponent(world, {
      metadata: {
        contractId: "component.Position",
      },
    })
  ),
};
```

## Override position value

Then we can override the position value before we call the move system and then remove the override once the transaction completes (or fails). The override needs a unique ID that we can refer to it by, and MUD provides a `uuid` utility for that.

```tsx !#3,8-14,17-19 packages/client/src/mud/setup.ts
import { createFaucetService, SingletonID } from "@latticexyz/network";
import { ethers } from "ethers";
import { uuid } from "@latticexyz/utils";
…
export const setup = async () => {
  …
  const moveTo = async (x: number, y: number) => {
    const positionId = uuid();
    components.Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    try {
      const tx = await result.systems["system.Move"].executeTyped({ x, y });
      await tx.wait();
    } finally {
      components.Position.removeOverride(positionId);
    }
  };
```

Wow, isn't that so much snappier? It hardly feels like a blockchain game anymore.
