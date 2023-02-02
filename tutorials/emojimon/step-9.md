---
order: -9
---

# 9. Obstructions

We can make player movement more interesting by turning the boulders into actual obstructions, so players can't walk through them.

## Obstruction component

Like our other "trait" or "behavior" components, we'll use a boolean component to indicate when an entity is an obstruction and can't be moved through.

```sol packages/contracts/src/components/ObstructionComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.Obstruction"));

contract ObstructionComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}

```

```ts !#4-8 packages/client/src/mud/components.ts
      contractId: "component.Movable",
    },
  }),
  Obstruction: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Obstruction",
    },
  }),
  Player: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Player",
```

## Create obstruction entities

During the terrain drawing loop in our init system, we can create obstruction entities for the boulders. We also need to attach their position, so we can query for them later.

```sol #2-3,14-15,29-33 packages/contracts/src/systems/InitSystem.sol
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { ObstructionComponent, ID as ObstructionComponentID } from "components/ObstructionComponent.sol";
import { TerrainType } from "../TerrainType.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  …
  function execute(bytes memory data) public returns (bytes memory) {
    MapConfigComponent mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID));
    if (mapConfig.isSet()) return new bytes(0);

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    ObstructionComponent obstruction = ObstructionComponent(getAddressById(components, ObstructionComponentID));

    // Alias these to make em easier to draw a tile map
    TerrainType O = TerrainType.None;
    TerrainType T = TerrainType.TallGrass;
    TerrainType B = TerrainType.TallGrass;
    …
    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        TerrainType terrainType = map[y][x];
        if (terrainType == TerrainType.None) continue;

        terrain[(y * width) + x] = bytes1(uint8(terrainType));

        if (terrainType == TerrainType.Boulder) {
          uint256 entity = world.getUniqueEntityId();
          position.set(entity, Coord(int32(x), int32(y)));
          obstruction.set(entity);
        }
      }
    }
```

Remember that any time we add a component or write to a new component from our systems, we need to update `deploy.json` so MUD can assign the correct access controls.

```json !#4,11 packages/contracts/deploy.json
  "components": [
    "MapConfigComponent",
    "MovableComponent",
    "ObstructionComponent",
    "PlayerComponent",
    "PositionComponent"
  ],
  "systems": [
    {
      "name": "InitSystem",
      "writeAccess": ["MapConfigComponent", "ObstructionComponent", "PositionComponent"],
      "initialize": "new bytes(0)"
    },
```

## Query for obstructions

A powerful part of MUD that we haven't covered yet is the query engine. We can use the query engine to find entities that have a component or have a particular component value.

We'll want to look for obstructions in both the move system and the join system, so we'll add a new function to our map library to query for obstructions.

```sol !#3-6,15-20 packages/contracts/src/LibMap.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { ID as ObstructionComponentID } from "components/ObstructionComponent.sol";
import { QueryType } from "solecs/interfaces/Query.sol";
import { IWorld, WorldQueryFragment } from "solecs/World.sol";

library LibMap {
  function distance(Coord memory from, Coord memory to) internal pure returns (int32) {
    int32 deltaX = from.x > to.x ? from.x - to.x : to.x - from.x;
    int32 deltaY = from.y > to.y ? from.y - to.y : to.y - from.y;
    return deltaX + deltaY;
  }

  function obstructions(IWorld world, Coord memory coord) internal view returns (uint256[] memory) {
    WorldQueryFragment[] memory fragments = new WorldQueryFragment[](2);
    fragments[0] = WorldQueryFragment(QueryType.HasValue, PositionComponentID, abi.encode(coord));
    fragments[1] = WorldQueryFragment(QueryType.Has, ObstructionComponentID, new bytes(0));
    return world.query(fragments);
  }
}

```

## Prevent moving through obstructions

Everything is lined up for a quick change to our move and join systems to prevent moving through or spawning on obstructions.

```sol !#4 packages/contracts/src/systems/MoveSystem.sol
    coord.x = (coord.x + int32(mapConfig.width)) % int32(mapConfig.width);
    coord.y = (coord.y + int32(mapConfig.height)) % int32(mapConfig.height);

    require(LibMap.obstructions(world, coord).length == 0, "this space is obstructed");

    position.set(entityId, coord);
  }
}
```

```sol !#4,9 packages/contracts/src/systems/JoinGameSystem.sol
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";
import { LibMap } from "../LibMap.sol";
…
    coord.x = (coord.x + int32(mapConfig.width)) % int32(mapConfig.width);
    coord.y = (coord.y + int32(mapConfig.height)) % int32(mapConfig.height);

    require(LibMap.obstructions(world, coord).length == 0, "this space is obstructed");

    player.set(entityId);
    PositionComponent(getAddressById(components, PositionComponentID)).set(entityId, coord);
    MovableComponent(getAddressById(components, MovableComponentID)).set(entityId);
```

## Optimistic rendering

Like before, we should update our optimistic rendering to reflect the new system constraints. Otherwise the client will let you move into an obstructed space but then quickly reverts, causing jank.

Fortunately, MUD has similar tools for the client to query for entities with certain components and/or component values.

```ts #2,7,17-24,27 packages/client/src/useMovement.ts
import { useCallback, useEffect } from "react";
import { Has, HasValue, runQuery } from "@latticexyz/recs";
import { useComponentValueStream } from "@latticexyz/std-client";
…
export const useMovement = () => {
  const {
    components: { Obstruction, Position },
    systems,
    playerEntity,
  } = useMUD();
  …
  const moveTo = useCallback(
    async (x: number, y: number) => {
      const wrappedX = (x + width) % width;
      const wrappedY = (y + height) % height;

      const obstructed = runQuery([
        Has(Obstruction),
        HasValue(Position, { x: wrappedX, y: wrappedY }),
      ]);
      if (obstructed.size > 0) {
        console.warn("cannot move to obstructed space");
        return;
      }
      …
    },
    [Obstruction, Position, height, playerEntity, systems, width]
  );
```
