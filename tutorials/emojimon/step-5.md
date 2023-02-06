---
order: -5
---

# 5. Denoting behavior with components

We're currently making too many assumptions about player entities and letting any entity move. That doesn't fit well with the ECS pattern, so let's refactor our code and move out some of these behaviors into their own components.

## Add player and movable components

We'll start by adding two new components, one to denote if an entity is a player, and another to denote if an entity can be moved. Both are simple boolean components.

```sol packages/contracts/src/components/PlayerComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.Player"));

contract PlayerComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}

```

```sol packages/contracts/src/components/MovableComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.Movable"));

contract MovableComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}

```

And tell MUD we want to deploy these new components, so we can start using them in the next step.

```json !#2 packages/contracts/deploy.json
{
  "components": ["MovableComponent", "PlayerComponent", "PositionComponent"],
  "systems": [
    {
      "name": "MoveSystem",
      "writeAccess": ["PositionComponent"]
    }
  ]
}
```

## Check for movable in move system

Now in our move system, we can check if an entity is movable before allowing it to move. This gives us a ton of flexibility in the future. If we want to make an entity movable, we just add the `Movable` component to it, and the move system handles the rest.

To keep this tutorial simple, the move system still assumes the `msg.sender` is the entity to move. But you can imagine expanding it to take an `entityId` as an argument and checking if the `msg.sender` can "control" the entity (e.g. an `OwnedBy` component) before allowing it to move (think chess pieces on a chess board).

```sol !#4,13-14 packages/contracts/src/systems/MoveSystem.sol
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";

uint256 constant ID = uint256(keccak256("system.Move"));

contract MoveSystem is System {
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    MovableComponent movable = MovableComponent(getAddressById(components, MovableComponentID));
    require(movable.has(entityId), "cannot move");

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    position.set(entityId, coord);
  }
}
```

## Join game system

Technically our player entity can't move anymore, because we haven't added the `Movable` component to it. To accommodate this, we'll add a join game system that "spawns" the player entity at a given position and adds our new components to it.

```sol packages/contracts/src/systems/JoinGameSystem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { addressToEntity } from "solecs/utils.sol";
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { PlayerComponent, ID as PlayerComponentID } from "components/PlayerComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";

uint256 constant ID = uint256(keccak256("system.JoinGame"));

contract JoinGameSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    return executeTyped(coord);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    PlayerComponent player = PlayerComponent(getAddressById(components, PlayerComponentID));
    require(!player.has(entityId), "already joined");

    player.set(entityId);
    PositionComponent(getAddressById(components, PositionComponentID)).set(entityId, coord);
    MovableComponent(getAddressById(components, MovableComponentID)).set(entityId);
  }
}

```

Just like the move system, we need to extend `deploy.json` to include our new join system and the components it needs to write to.

```json !#4-7 packages/contracts/deploy.json
{
  "components": ["MovableComponent", "PlayerComponent", "PositionComponent"],
  "systems": [
    {
      "name": "JoinGameSystem",
      "writeAccess": ["MovableComponent", "PlayerComponent", "PositionComponent"]
    },
    {
      "name": "MoveSystem",
      "writeAccess": ["PositionComponent"]
    }
  ]
}
```

## Add components to client

In the future, we hope to make MUD automatically generate the client code for us. But for now, we need to manually add the new components to the client.

```ts !#1-4,8-17 packages/client/src/mud/components.ts
import {
  defineBoolComponent,
  defineCoordComponent,
} from "@latticexyz/std-client";
import { world } from "./world";

export const components = {
  Movable: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Movable",
    },
  }),
  Player: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Player",
    },
  }),
  Position: defineCoordComponent(world, {
    metadata: {
      contractId: "component.Position",
```

## Refactor client movement

Our game board file is getting a little large. Before we wire up the join game system, let's refactor our movement code into its own hook to make it easier to use.

```ts packages/client/src/useMovement.ts
import { useCallback, useEffect, useMemo } from "react";
import { useComponentValueStream } from "@latticexyz/std-client";
import { uuid } from "@latticexyz/utils";
import { useMUD } from "./MUDContext";

export const useMovement = () => {
  const {
    components: { Position },
    systems,
    playerEntity,
  } = useMUD();

  const playerPosition = useComponentValueStream(Position, playerEntity);

  const moveTo = useCallback(
    async (x: number, y: number) => {
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
    },
    [Position, playerEntity, systems]
  );

  const moveBy = useCallback(
    async (deltaX: number, deltaY: number) => {
      if (!playerPosition) {
        console.warn("cannot moveBy without a player position, not yet spawned?");
        return;
      }
      await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY);
    },
    [moveTo, playerPosition]
  );

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

  return useMemo(() => ({ moveTo, moveBy }), [moveTo, moveBy]);
};
```

Now we can swap out all of the inline logic with our new hook.

```tsx !#3,15,30 packages/client/src/GameBoard.tsx
import { useComponentValueStream } from "@latticexyz/std-client";
import { useMUD } from "./MUDContext";
import { useMovement } from "./useMovement";

export const GameBoard = () => {
  const rows = new Array(10).fill(0).map((_, i) => i);
  const columns = new Array(10).fill(0).map((_, i) => i);

  const {
    components: { Position },
    playerEntity,
  } = useMUD();

  const playerPosition = useComponentValueStream(Position, playerEntity);
  const { moveTo } = useMovement();

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
            {playerPosition?.x === x && playerPosition?.y === y ? <>🤠</> : null}
          </div>
        ))
      )}
    </div>
  );
};
```

## Join game on click

Similar to our movement hook, we need a join game hook to determine if we've already joined and, if not, call our system.

```ts packages/client/src/useJoinGame.ts
import { useCallback, useMemo } from "react";
import { useComponentValueStream } from "@latticexyz/std-client";
import { useMUD } from "./MUDContext";

export const useJoinGame = () => {
  const {
    components: { Player },
    systems,
    playerEntity,
  } = useMUD();

  const canJoinGame = useComponentValueStream(Player, playerEntity)?.value !== true;

  const joinGame = useCallback(
    async (x: number, y: number) => {
      if (!canJoinGame) {
        throw new Error("already joined game");
      }

      const tx = await systems["system.JoinGame"].executeTyped({ x, y });
      await tx.wait();
    },
    [canJoinGame, systems]
  );

  return useMemo(() => ({ canJoinGame, joinGame }), [canJoinGame, joinGame]);
};
```

And add it to the game board.

```tsx !#4,17,32-36 packages/client/src/GameBoard.tsx
import { useComponentValueStream } from "@latticexyz/std-client";
import { useMUD } from "./MUDContext";
import { useMovement } from "./useMovement";
import { useJoinGame } from "./useJoinGame";

export const GameBoard = () => {
  const rows = new Array(10).fill(0).map((_, i) => i);
  const columns = new Array(10).fill(0).map((_, i) => i);

  const {
    components: { Position },
    playerEntity,
  } = useMUD();

  const playerPosition = useComponentValueStream(Position, playerEntity);
  const { moveTo } = useMovement();
  const { canJoinGame, joinGame } = useJoinGame();

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
              if (canJoinGame) {
                joinGame(x, y);
              } else {
                moveTo(x, y);
              }
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

## Optimistic player join

You may see a delay between clicking a tile and the player appearing. Similar to the optimistic rendering we did for movement, we can use an override to make the player appear immediately.

```ts !#4 packages/client/src/mud/setup.ts
  // Add support for optimistic rendering
  const componentsWithOverrides = {
    Position: overridableComponent(components.Position),
    Player: overridableComponent(components.Player),
  };

  return {
```

```ts !#3,21-38,40 packages/client/src/useJoinGame.tss
import { useCallback, useMemo } from "react";
import { useComponentValueStream } from "@latticexyz/std-client";
import { uuid } from "@latticexyz/utils";
import { useMUD } from "./MUDContext";

export const useJoinGame = () => {
  const {
    components: { Position, Player },
    systems,
    playerEntity,
  } = useMUD();

  const canJoinGame = useComponentValueStream(Player, playerEntity)?.value !== true;

  const joinGame = useCallback(
    async (x: number, y: number) => {
      if (!canJoinGame) {
        throw new Error("already joined game");
      }

      const positionId = uuid();
      Position.addOverride(positionId, {
        entity: playerEntity,
        value: { x, y },
      });
      const playerId = uuid();
      Player.addOverride(playerId, {
        entity: playerEntity,
        value: { value: true },
      });

      try {
        const tx = await systems["system.JoinGame"].executeTyped({ x, y });
        await tx.wait();
      } finally {
        Position.removeOverride(positionId);
        Player.removeOverride(playerId);
      }
    },
    [Player, Position, canJoinGame, playerEntity, systems]
  );

  return useMemo(() => ({ canJoinGame, joinGame }), [canJoinGame, joinGame]);
};
```
