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

```ts !#2,8-17 packages/client/src/mud/components.ts
import {
  defineBoolComponent,
  defineCoordComponent,
} from "@latticexyz/std-client";
import { world } from "./world";

export const contractComponents = {
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

```ts packages/client/src/useKeyboardMovement.ts
import { useEffect } from "react";
import { useMUD } from "./MUDContext";

export const useKeyboardMovement = () => {
  const {
    api: { moveBy },
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
};
```

Now we can swap out all of the inline logic with our new hook.

```tsx !#3,11,15 packages/client/src/GameBoard.tsx
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";

export const GameBoard = () => {
  const rows = new Array(20).fill(0).map((_, i) => i);
  const columns = new Array(20).fill(0).map((_, i) => i);

  const {
    components: { Position },
    api: { moveTo },
    playerEntity,
  } = useMUD();

  useKeyboardMovement();

  const playerPosition = useComponentValue(Position, playerEntity);
```

## Join game on click

Similar to our movement helpers, we'll add join game helper to make it easier to call our join system.

```ts !#3-13,20 packages/client/src/mud/setup.ts
export const setup = async () => {
  …
  const joinGame = async (x: number, y: number) => {
    const canJoinGame =
      getComponentValue(components.Player, playerEntity)?.value !== true;

    if (!canJoinGame) {
      throw new Error("already joined game");
    }

    const tx = await result.systems["system.JoinGame"].executeTyped({ x, y });
    await tx.wait();
  };

  return {
    …
    api: {
      moveTo,
      moveBy,
      joinGame,
    },
  };
};
```

And add it to the game board.

```tsx !#6-7,14,29-31,33 packages/client/src/GameBoard.tsx
export const GameBoard = () => {
  const rows = new Array(20).fill(0).map((_, i) => i);
  const columns = new Array(20).fill(0).map((_, i) => i);

  const {
    components: { Position, Player },
    api: { moveTo, joinGame },
    playerEntity,
  } = useMUD();

  useKeyboardMovement();

  const playerPosition = useComponentValue(Position, playerEntity);
  const canJoinGame = useComponentValue(Player, playerEntity)?.value !== true;

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

```ts !#7,13 packages/client/src/mud/components.ts
export const contractComponents = {
  Movable: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Movable",
    },
  }),
  Player: overridableComponent(
    defineBoolComponent(world, {
      metadata: {
        contractId: "component.Player",
      },
    })
  ),
```

```ts !#11-22,25-28 packages/client/src/mud/setup.ts
export const setup = async () => {
  …
  const joinGame = async (x: number, y: number) => {
    const canJoinGame =
      getComponentValue(components.Player, playerEntity)?.value !== true;

    if (!canJoinGame) {
      throw new Error("already joined game");
    }

    const positionId = uuid();
    components.Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });
    const playerId = uuid();
    components.Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });

    try {
      const tx = await result.systems["system.JoinGame"].executeTyped({ x, y });
      await tx.wait();
    } finally {
      components.Position.removeOverride(positionId);
      components.Player.removeOverride(playerId);
    }
  };
```
