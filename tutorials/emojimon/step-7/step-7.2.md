# 7.2. Constrain movement to map size

We're not doing any bounds checks for movement yet, so you can technically move off the map. Now that the map size is configured in ECS, we'll use that to make the player "wrap around" when you move off the edge of the map.

## Update move system

We'll need to make updates in a few places. Let's start with the move system. We'll do a little math to wrap the player coordinate around the map size.

```sol !#4,16-19 packages/contracts/src/systems/MoveSystem.sol
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";

uint256 constant ID = uint256(keccak256("system.Move"));

contract MoveSystem is System {
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    MovableComponent movable = MovableComponent(getAddressById(components, MovableComponentID));
    require(movable.has(entityId), "cannot move");

    // Constrain position to map size, wrapping around if necessary
    MapConfig memory mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID)).getValue();
    coord.x = (coord.x + int32(mapConfig.width)) % int32(mapConfig.width);
    coord.y = (coord.y + int32(mapConfig.height)) % int32(mapConfig.height);

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    position.set(entityId, coord);
  }
}
```

## Update join system

We also want to make sure players can't join off the edge of the map, so we'll add the same logic there.

```sol !#4,16-19 packages/contracts/src/systems/JoinGameSystem.sol
import { PlayerComponent, ID as PlayerComponentID } from "components/PlayerComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";

uint256 constant ID = uint256(keccak256("system.JoinGame"));

contract JoinGameSystem is System {
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    PlayerComponent player = PlayerComponent(getAddressById(components, PlayerComponentID));
    require(!player.has(entityId), "already joined");

    // Constrain position to map size, wrapping around if necessary
    MapConfig memory mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID)).getValue();
    coord.x = (coord.x + int32(mapConfig.width)) % int32(mapConfig.width);
    coord.y = (coord.y + int32(mapConfig.height)) % int32(mapConfig.height);

    player.set(entityId);
    PositionComponent(getAddressById(components, PositionComponentID)).set(entityId, coord);
    MovableComponent(getAddressById(components, MovableComponentID)).set(entityId);
  }
}
```

## Optimistic updates

If you try to move off the edge of the map, you may see your player disappear for a second and then reappear on the other side of the map. This is because we're doing an optimistic update for movement, but it's not accounting for our new wrapping logic. Let's add that in.

```ts !#5,14,22-25,35 packages/client/src/useMovement.ts
import { useCallback, useEffect } from "react";
import { useComponentValueStream } from "@latticexyz/std-client";
import { uuid } from "@latticexyz/utils";
import { useMUD } from "./MUDContext";
import { useMapConfig } from "./useMapConfig";

export const useMovement = () => {
  const {
    components: { Position },
    systems,
    playerEntity,
  } = useMUD();

  const { width, height } = useMapConfig();
  const playerPosition = useComponentValueStream(Position, playerEntity);

  const moveTo = useCallback(
    async (x: number, y: number) => {
      const positionId = uuid();
      Position.addOverride(positionId, {
        entity: playerEntity,
        value: {
          x: (x + width) % width,
          y: (y + height) % height,
        },
      });

      try {
        const tx = await systems["system.Move"].executeTyped({ x, y });
        await tx.wait();
      } finally {
        Position.removeOverride(positionId);
      }
    },
    [Position, height, playerEntity, systems, width]
  );

```
