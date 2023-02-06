# 7.3. Only move to adjacent spaces

It would feel more game-like if the player could only move one space at a time, rather than being able to teleport to any space on the map. Let's add that.

## Map library

Let's start with a new library for the map logic. This will keep the complicated, pure functions outside of our systems to make them a little easier to follow. We'll use the "Manhattan distance" approach for checking the distance between two coordinates.

```sol packages/contracts/src/LibMap.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Coord } from "components/PositionComponent.sol";

library LibMap {
  function distance(Coord memory from, Coord memory to) internal pure returns (int32) {
    int32 deltaX = from.x > to.x ? from.x - to.x : to.x - from.x;
    int32 deltaY = from.y > to.y ? from.y - to.y : to.y - from.y;
    return deltaX + deltaY;
  }
}

```

## Check distance in move system

Now we can use our new distance function to check that the player is only moving one space at a time.

```sol !#4,16-17,24 packages/contracts/src/systems/MoveSystem.sol
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";
import { LibMap } from "../LibMap.sol";

uint256 constant ID = uint256(keccak256("system.Move"));

contract MoveSystem is System {
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    MovableComponent movable = MovableComponent(getAddressById(components, MovableComponentID));
    require(movable.has(entityId), "cannot move");

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    require(LibMap.distance(position.getValue(entityId), coord) == 1, "can only move to adjacent spaces");

    // Constrain position to map size, wrapping around if necessary
    MapConfig memory mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID)).getValue();
    coord.x = (coord.x + int32(mapConfig.width)) % int32(mapConfig.width);
    coord.y = (coord.y + int32(mapConfig.height)) % int32(mapConfig.height);

    position.set(entityId, coord);
```

## Remove click-to-move

Keyboard movement is already configured to move one tile at a time, but we can still click anywhere on the map to move there. With our new distance check, clicking more than one tile away will cause our transactions to fail/revert—not a great user experience. Let's update our client to only allow click-to-spawn.

```ts !#4,13-15,22-24 packages/client/src/GameBoard.tsx
export const GameBoard = () => {
  …
  const playerPosition = useComponentValueStream(Position, playerEntity);
  useMovement();
  const { canJoinGame, joinGame } = useJoinGame();

  return (
    <div className="inline-grid p-2 bg-lime-500">
      {rows.map((y) =>
        columns.map((x) => (
          <div
            key={`${x},${y}`}
            className={`w-8 h-8 flex items-center justify-center ${
              canJoinGame ? "cursor-pointer hover:ring" : ""
            }`}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
            onClick={(event) => {
              event.preventDefault();
              if (canJoinGame) {
                joinGame(x, y);
              }
            }}
          >
            {playerPosition?.x === x && playerPosition?.y === y ? <>🤠</> : null}
          </div>
```
