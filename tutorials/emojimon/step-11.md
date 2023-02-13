---
order: -11
---

# 11. Make it massively multiplayer

We've come so far! Wouldn't it be great if we could play Emojimon with our friends?

Since MUD handles all the networking for us, and because we're using a common backend (the blockchain), it's surprisingly easy to make our game massively multiplayer.

## Render other players

We're currently only rendering our own player. To make the game multiplayer, we just need to query for other players and render them too!

```tsx !#1-2,5,9,16-26,37-39,53-58 packages/client/src/GameBoard.tsx
import { useEffect, useMemo, useState } from "react";
import { EntityID, getComponentValueStrict, Has } from "@latticexyz/recs";
…
import { EncounterScreen } from "./EncounterScreen";
import { useEntityQuery } from "./useEntityQuery";

export const GameBoard = () => {
  const {
    components: { Encounter, Player, Position },
    playerEntity,
  } = useMUD();
  …
  const playerPosition = useComponentValueStream(Position, playerEntity);
  useMovement();

  const otherPlayers = useEntityQuery(
    useMemo(() => [Has(Player), Has(Position)], [Player, Position])
  )
    .filter((entity) => entity !== playerEntity)
    .map((entity) => {
      const position = getComponentValueStrict(Position, entity);
      return {
        entity,
        position,
      };
    });
  …
  return (
    <div className="inline-grid p-2 bg-lime-500 relative overflow-hidden">
      {rows.map((y) =>
        columns.map((x) => {
          const terrain = mapConfig.terrainValues.find(
            (t) => t.x === x && t.y === y
          )?.type;

          const hasPlayer = playerPosition?.x === x && playerPosition?.y === y;
          const otherPlayersHere = otherPlayers.filter(
            (p) => p.position.x === x && p.position.y === y
          );

          return (
            <div
              key={`${x},${y}`}
              …
            >
              …
              <div className="flex flex-wrap gap-1 items-center justify-center relative">
                {terrain ? (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none">
                    {terrain.emoji}
                  </div>
                ) : null}
                <div className="relative">
                  {hasPlayer ? <>🤠</> : null}
                  {otherPlayersHere.map((p) => (
                    <span key={p.entity}>🥸</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
```

Don't you wish all games were this easy to make multiplayer?
