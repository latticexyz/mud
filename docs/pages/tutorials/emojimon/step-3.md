# 3. Move player with arrow keys

Let's wire up the keyboard to control the player position. We'll listen for `keydown` events on the `window` and move the player based on which arrow key is pressed.

You may notice a delay between movements. That's because our transactions take some time to confirm. Even though the block time for our local anvil node is set to just one second, it still feels sluggish. That's kind of the nature of the blockchain, but we'll improve on that in the next step with optimistic rendering.

## Movement helpers

To keep our React code tidy, we'll create a few helper methods for movement that we can export alongside our systems and components after they've been set up.

```tsx !#2,7-19,29-32 packages/client/src/mud/setup.ts
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { EntityID, getComponentValue } from "@latticexyz/recs";
import { createFaucetService, SingletonID } from "@latticexyz/network";
…
export const setup = async () => {
  …
  const moveTo = async (x: number, y: number) => {
    const tx = await result.systems["system.Move"].executeTyped({ x, y });
    await tx.wait();
  };

  const moveBy = async (deltaX: number, deltaY: number) => {
    const playerPosition = getComponentValue(components.Position, playerEntity);
    if (!playerPosition) {
      console.warn("cannot moveBy without a player position, not yet spawned?");
      return;
    }
    await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY);
  };

  return {
    ...result,
    world,
    singletonEntityId: SingletonID,
    singletonEntity,
    playerEntityId,
    playerEntity,
    components,
    api: {
      moveTo,
      moveBy,
    },
  };
};
```

## Keyboard movement

Now we can listen for for arrow key presses to move the player in the corresponding direction.

```tsx !#1,9,13-31,48 packages/client/src/GameBoard.tsx
import { useEffect } from "react";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const GameBoard = () => {
  …
  const {
    components: { Position },
    api: { moveTo, moveBy },
    playerEntity,
  } = useMUD();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        moveBy(0, -1);
      }
      if (e.key === "ArrowDown") {
        moveBy(0, 1);
      }
      if (e.key === "ArrowLeft") {
        moveBy(-1, 0);
      }
      if (e.key === "ArrowRight") {
        moveBy(1, 0);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [moveBy]);

  const playerPosition = useComponentValue(Position, playerEntity);

  return (
    <div className="inline-grid p-2 bg-lime-500">
      {rows.map((y) =>
        columns.map((x) => (
          <div
            key={`${x},${y}`}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:ring"
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
            onClick={(event) => {
              event.preventDefault();
              moveTo(x, y);
            }}
          >
```
