---
order: -2
---

# 2. Show player at position, click to move

The component and system we just created will become much more real once we can see them in action. Let's set up the client to use them.

## Client-side component

Before we can use the new `Position` component on the client, we need to define it in our `components.ts` file. This will allow MUD's network layer to decode component value updates in the contract for us to query in the client.

(We can remove the `Counter` component for now, too.)

```ts !#1,5-9 packages/clients/src/mud/components.ts
import { defineCoordComponent } from "@latticexyz/std-client";
import { world } from "./world";

export const contractComponents = {
  Position: defineCoordComponent(world, {
    metadata: {
      contractId: "component.Position",
    },
  }),
};
```

## Render the world

Let's create a new React component called `GameBoard` that represents the world. We'll start by rendering a simple 20&times;20 grid, filled with lime green as the "grass".

(The CSS class names come from Tailwind. Don't worry if they don't make much sense. It just lets us write styled markup that is easy to copy-and-paste.)

```tsx packages/client/src/GameBoard.tsx
export const GameBoard = () => {
  const rows = new Array(20).fill(0).map((_, i) => i);
  const columns = new Array(20).fill(0).map((_, i) => i);

  return (
    <div className="inline-grid p-2 bg-lime-500">
      {rows.map((y) =>
        columns.map((x) => (
          <div
            key={`${x},${y}`}
            className="w-8 h-8"
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
          ></div>
        ))
      )}
    </div>
  );
};
```

Then render the new `GameBoard` component from our base `App` component, replacing the previous counter increment logic.

```tsx packages/client/src/App.tsx
import { GameBoard } from "./GameBoard";

export const App = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <GameBoard />
    </div>
  );
};
```

And a small tweak to `index.html` to give the page a black background and make it feel more like a game console.

```html !#4 packages/client/index.html
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>a minimal MUD client</title>
  </head>
  <body class="bg-black text-white">
    <div id="react-root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
```

## Move the player

There's no player on the game board because it doesn't have a position yet. Wire up a click handler on each tile to set the player position (using our `Move` system). Once a tile is clicked, the player appears and we can continue moving it around the map by clicking other tiles.

```tsx !#1-2,8-14,22,27-30,32 packages/client/src/GameBoard.tsx
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const GameBoard = () => {
  const rows = new Array(20).fill(0).map((_, i) => i);
  const columns = new Array(20).fill(0).map((_, i) => i);

  const {
    components: { Position },
    systems,
    playerEntity,
  } = useMUD();

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
              systems["system.Move"].executeTyped({ x, y });
            }}
          >
            {playerPosition?.x === x && playerPosition?.y === y ? <>🤠</> : null}
          </div>
        ))
      )}
    </div>
  );
};
```
