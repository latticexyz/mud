# 3. Move player with arrow keys

Let's wire up the keyboard to control the player position. We'll listen for `keydown` events on the `window` and move the player based on which arrow key is pressed.

You may notice a delay between movements. That's because our transactions take some time to confirm. Even though the block time for our local anvil node is set to just one second, it still feels sluggish. That's kind of the nature of the blockchain, but we'll improve on that in the next step with optimistic rendering.

```tsx !#1,9-42 packages/client/src/GameBoard.tsx
import { useEffect } from "react";
import { useComponentValueStream } from "@latticexyz/std-client";
import { useMUD } from "./MUDContext";

export const GameBoard = () => {
  …
  const playerPosition = useComponentValueStream(Position, playerEntity);

  useEffect(() => {
    const moveTo = async (x: number, y: number) => {
      const tx = await systems["system.Move"].executeTyped({ x, y });
      await tx.wait();
    };

    const moveBy = async (deltaX: number, deltaY: number) => {
      if (!playerPosition) {
        console.warn(
          "cannot moveBy without a player position, not yet spawned?"
        );
        return;
      }
      await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY);
    };

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
  }, [playerPosition, systems]);

  return (
    <div className="inline-grid p-2 bg-lime-500">
      {rows.map((y) =>
```
