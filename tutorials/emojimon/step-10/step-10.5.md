---
order: -10.5
---

# 10.5. Encounter screen

We're ready to wire up the encounter on the client! We'll make a new encounter screen that we can transition to as you enter into an encounter. And we'll add a fun animation for it.

## Add encounter screen

Let's start with a mostly empty encounter screen. We'll fill it in as we go.

```tsx packages/client/src/EncounterScreen.tsx
import { EntityID } from "@latticexyz/recs";
import { useEffect, useState } from "react";

type Props = {
  encounterId: EntityID;
};

export const EncounterScreen = ({ encounterId }: Props) => {
  // TODO: better transition in
  const [appear, setAppear] = useState(false);
  useEffect(() => {
    setAppear(true);
  }, []);

  return (
    <div
      className={`flex flex-col gap-10 items-center justify-center bg-black text-white transition-opacity duration-1000 ${
        appear ? "opacity-100" : "opacity-0"
      }`}
    >
      A wild emojimon appears!
    </div>
  );
};
```

We'll need to know if we're in an encounter before we display the screen, so let's query for that.

```tsx !#1,6,13-14 packages/client/src/GameBoard.tsx
import { EntityID } from "@latticexyz/recs";
import { useComponentValueStream } from "@latticexyz/std-client";
…
export const GameBoard = () => {
  const {
    components: { Encounter, Position },
    playerEntity,
  } = useMUD();
  …
  const playerPosition = useComponentValueStream(Position, playerEntity);
  useMovement();

  const encounterId = useComponentValueStream(Encounter, playerEntity)
    ?.value as EntityID | undefined;
```

Then conditionally render the encounter screen if we're in an encounter.

```tsx !#3,14-26 packages/client/src/GameBoard.tsx
import { useJoinGame } from "./useJoinGame";
import { useMovement } from "./useMovement";
import { EncounterScreen } from "./EncounterScreen";

export const GameBoard = () => {
  …
  return (
    <div className="inline-grid p-2 bg-lime-500">
      {rows.map((y) =>
        columns.map((x) => {
          …
        })
      )}
      {encounterId ? (
        <div
          className="-m-2 bg-black text-white flex items-center justify-center"
          style={{
            gridColumnStart: 1,
            gridColumnEnd: mapConfig.width + 1,
            gridRowStart: 1,
            gridRowEnd: mapConfig.height + 1,
          }}
        >
          <EncounterScreen encounterId={encounterId} />
        </div>
      ) : null}
    </div>
  );
};
```

## Battle animation

Let's kick up the nostalgia with a fun battle animation. The repo started with this animation configured already (see `tailwind.config.cjs`), so we just need wire up the class names to the right elements in our game board.

```tsx !#1,9-15,18,25,32-42,49,55 packages/client/src/GameBoard.tsx
import { useEffect, useState } from "react";
import { EntityID } from "@latticexyz/recs";
…
export const GameBoard = () => {
  …
  const encounterId = useComponentValueStream(Encounter, playerEntity)
    ?.value as EntityID | undefined;

  const [showEncounter, setShowEncounter] = useState(false);
  // Reset show encounter when we leave encounter
  useEffect(() => {
    if (!encounterId) {
      setShowEncounter(false);
    }
  }, [encounterId]);

  return (
    <div className="inline-grid p-2 bg-lime-500 relative overflow-hidden">
      {rows.map((y) =>
        columns.map((x) => {
          const terrain = mapConfig.terrainValues.find(
            (t) => t.x === x && t.y === y
          )?.type;

          const hasPlayer = playerPosition?.x === x && playerPosition?.y === y;

          return (
            <div
              key={`${x},${y}`}
              …
            >
              {hasPlayer && encounterId ? (
                <div
                  className="absolute z-10 animate-battle"
                  style={{
                    boxShadow: "0 0 0 100vmax black",
                  }}
                  onAnimationEnd={() => {
                    setShowEncounter(true);
                  }}
                ></div>
              ) : null}
              <div className="flex flex-wrap gap-1 items-center justify-center relative">
                {terrain ? (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none">
                    {terrain.emoji}
                  </div>
                ) : null}
                <div className="relative">{hasPlayer ? <>🤠</> : null}</div>
              </div>
            </div>
          );
        })
      )}
      {encounterId && showEncounter ? (
        <div
          className="-m-2 z-20 bg-black text-white flex items-center justify-center"
```

What we've done here is change the order that things render. Instead of immediately rendering the encounter, we render our battle animation near our player. The position of this element near our player helps the battle animation focus in on the player. Then, when the battle animation ends (`onAnimationEnd`), we show the encounter.

We also needed to add a `useEffect` to clear the `showEncounter` state when we leave the encounter, so we don't get stuck in the encounter screen and the battle animation can play again for the next encounter.

## Show monster

In the encounter screen, we can query for and render the monster that just appeared.

```tsx !#1-5,12-28,42-43 packages/client/src/EncounterScreen.tsx
import { EntityID, getComponentValueStrict, Has, HasValue } from "@latticexyz/recs";
import { useEntityQuery } from "./useEntityQuery";
import { useMUD } from "./MUDContext";
import { useEffect, useState } from "react";
import { MonsterType, monsterTypes } from "./monsterTypes";

type Props = {
  encounterId: EntityID;
};

export const EncounterScreen = ({ encounterId }: Props) => {
  const {
    world,
    components: { Encounter, MonsterType },
  } = useMUD();

  const monster = useEntityQuery([HasValue(Encounter, { value: encounterId }), Has(MonsterType)]).map((entity) => {
    const monsterType = getComponentValueStrict(MonsterType, entity).value as MonsterType;
    return {
      entity,
      entityId: world.entities[entity],
      monster: monsterTypes[monsterType],
    };
  })[0];

  if (!monster) {
    throw new Error("No monster found in encounter");
  }

  // TODO: better transition in
  const [appear, setAppear] = useState(false);
  useEffect(() => {
    setAppear(true);
  }, []);

  return (
    <div
      className={`flex flex-col gap-10 items-center justify-center bg-black text-white transition-opacity duration-1000 ${
        appear ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-8xl animate-bounce">{monster.monster.emoji}</div>
      <div>A wild {monster.monster.name} appears!</div>
    </div>
  );
};
```

Technically the query can return multiple monster entities, but we know we only spawned one, so we'll just use the first one in the list. You can imagine easily extending this to support multiple monsters!
