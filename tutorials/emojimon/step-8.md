---
order: -8
---

# 8. Add terrain

Let's make the world a bit more interesting with terrain!

## Terrain types

We'll start with just a few terrain types for now: tall grass and boulders.

```sol packages/contracts/src/TerrainType.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

enum TerrainType {
  None,
  TallGrass,
  Boulder
}

```

We can go ahead and add these types to the client too. Starting the TypeScript enum index at `1` allows us to sort of "ignore" the `None` (or zero) value from Solidity, which will make downstream types a little easier to work with.

```ts packages/client/src/terrainTypes.ts
export enum TerrainType {
  TallGrass = 1,
  Boulder,
}

type TerrainConfig = {
  emoji: string;
};

export const terrainTypes: Record<TerrainType, TerrainConfig> = {
  [TerrainType.TallGrass]: {
    emoji: "🌳",
  },
  [TerrainType.Boulder]: {
    emoji: "🪨",
  },
};
```

## Draw the terrain map

If we were following pure ECS patterns, we'd create a terrain type component and, for each position on the map, we'd create a tile entity and add the terrain type and position components to it. However, because we're in Solidity, this would exceed the 30M block gas limit for our init system deploy.

Instead, we'll "bitpack" the terrain values into a single `bytes` value and store it in our map config component.

Let's draw the terrain map first.

```sol !#4,14-53 packages/contracts/src/systems/InitSystem.sol
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";
import { TerrainType } from "../TerrainType.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  …
  function execute(bytes memory data) public returns (bytes memory) {
    MapConfigComponent mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID));
    if (mapConfig.isSet()) return new bytes(0);

    // Alias these to make it easier to draw the terrain map
    TerrainType O = TerrainType.None;
    TerrainType T = TerrainType.TallGrass;
    TerrainType B = TerrainType.Boulder;

    TerrainType[20][20] memory map = [
      [O, O, O, O, O, O, T, O, O, O, O, O, O, O, O, O, O, O, O, O],
      [O, O, T, O, O, O, O, O, T, O, O, O, O, B, O, O, O, O, O, O],
      [O, T, T, T, T, O, O, O, O, O, O, O, O, O, O, T, T, O, O, O],
      [O, O, T, T, T, T, O, O, O, O, B, O, O, O, O, O, T, O, O, O],
      [O, O, O, O, T, T, O, O, O, O, O, O, O, O, O, O, O, T, O, O],
      [O, O, O, B, B, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O],
      [O, T, O, O, O, B, B, O, O, O, O, T, O, O, O, O, O, B, O, O],
      [O, O, T, T, O, O, O, O, O, T, O, B, O, O, T, O, B, O, O, O],
      [O, O, T, O, O, O, O, T, T, T, O, B, B, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, T, T, T, O, B, T, O, T, T, O, O, O, O],
      [O, B, O, O, O, B, O, O, T, T, O, B, O, O, T, T, O, O, O, O],
      [O, O, B, O, O, O, T, O, T, T, O, O, B, T, T, T, O, O, O, O],
      [O, O, B, B, O, O, O, O, T, O, O, O, B, O, T, O, O, O, O, O],
      [O, O, O, B, B, O, O, O, O, O, O, O, O, B, O, T, O, O, O, O],
      [O, O, O, O, B, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O],
      [O, O, O, O, O, O, O, O, O, O, B, B, O, O, T, O, O, O, O, O],
      [O, O, O, O, T, O, O, O, T, B, O, O, O, T, T, O, B, O, O, O],
      [O, O, O, T, O, T, T, T, O, O, O, O, O, T, O, O, O, O, O, O],
      [O, O, O, T, T, T, T, O, O, O, O, T, O, O, O, T, O, O, O, O],
      [O, O, O, O, O, T, O, O, O, O, O, O, O, O, O, O, O, O, O, O]
    ];

    uint32 height = uint32(map.length);
    uint32 width = uint32(map[0].length);
    bytes memory terrain = new bytes(width * height);

    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        TerrainType terrainType = map[y][x];
        if (terrainType == TerrainType.None) continue;

        terrain[(y * width) + x] = bytes1(uint8(terrainType));
      }
    }

    mapConfig.set(MapConfig({ width: 10, height: 10 }));
  }
}
```

We still need to update our map config component to support the new terrain map, so let's do that next. Don't forget to update the schema!

```sol !#4,11-12,20-21,29,33-34 packages/contracts/src/components/MapConfigComponent.sol
struct MapConfig {
  uint32 width;
  uint32 height;
  bytes terrain;
}

contract MapConfigComponent is BareComponent {
  constructor(address world) BareComponent(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "width";
    values[0] = LibTypes.SchemaValue.UINT32;

    keys[1] = "height";
    values[1] = LibTypes.SchemaValue.UINT32;

    keys[2] = "terrain";
    values[2] = LibTypes.SchemaValue.STRING;
  }

  function isSet() public view returns (bool) {
    return has(SingletonID);
  }

  function set(MapConfig memory mapConfig) public {
    set(SingletonID, abi.encode(mapConfig.width, mapConfig.height, mapConfig.terrain));
  }

  function getValue() public view returns (MapConfig memory) {
    (uint32 width, uint32 height, bytes memory terrain) = abi.decode(getRawValue(SingletonID), (uint32, uint32, bytes));
    return MapConfig(width, height, terrain);
  }
}

```

You may have noticed that we're using the `STRING` schema value type. The MUD client currently has some issues decoding `BYTES` schema types, so this is a quick workaround. At the moment, schemas are only used in the client for decoding, so we can continue to use `bytes` in the map config struct and init system.

Now to update our map config with the terrain and new map size. You may have to restart your `mud dev` server to pick up changes to the map config.

```sol !#18 packages/contracts/src/systems/InitSystem.sol
contract InitSystem is System {
  …
  function execute(bytes memory data) public returns (bytes memory) {
    …
    uint32 height = uint32(map.length);
    uint32 width = uint32(map[0].length);
    bytes memory terrain = new bytes(width * height);

    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        TerrainType terrainType = map[y][x];
        if (terrainType == TerrainType.None) continue;

        terrain[(y * width) + x] = bytes1(uint8(terrainType));
      }
    }

    mapConfig.set(MapConfig({ width: width, height: height, terrain: terrain }));
  }
}
```

## Render terrain on the client

Before we can use the terrain string, we need to make our client component aware of it.

```ts !#4 packages/client/src/mud/components.ts
    {
      width: Type.Number,
      height: Type.Number,
      terrain: Type.String,
    },
    {
      id: "MapConfig",
```

And now we can extend our `useMapConfig` hook to parse the terrain string into an array of positions and terrain types. This will make it easier to render the map next.

```ts !#2,4,18-26 packages/client/src/useMapConfig.ts
import { getComponentValue } from "@latticexyz/recs";
import { ethers } from "ethers";
import { useMUD } from "./MUDContext";
import { terrainTypes, TerrainType } from "./terrainTypes";

export const useMapConfig = () => {
  const {
    components: { MapConfig },
    singletonEntity,
  } = useMUD();

  const mapConfig = getComponentValue(MapConfig, singletonEntity);

  if (mapConfig == null) {
    throw new Error("game config not set or not ready, only use this hook after loading state === LIVE");
  }

  const { width, height, terrain } = mapConfig;
  const terrainValues = Array.from(ethers.utils.toUtf8Bytes(terrain)).map((value, index) => ({
    x: index % width,
    y: Math.floor(index / width),
    value,
    type: value in TerrainType ? terrainTypes[value as TerrainType] : null,
  }));

  return { width, height, terrain, terrainValues };
};
```

The last step is to draw the terrain emojis on the game board.

```tsx !#7-9,28-39 packages/client/src/GameBoard.tsx
export const GameBoard = () => {
  …
  return (
    <div className="inline-grid p-2 bg-lime-500">
      {rows.map((y) =>
        columns.map((x) => {
          const terrain = mapConfig.terrainValues.find(
            (t) => t.x === x && t.y === y
          )?.type;

          return (
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
              <div className="flex flex-wrap gap-1 items-center justify-center relative">
                {terrain ? (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none">
                    {terrain.emoji}
                  </div>
                ) : null}
                <div className="relative">
                  {playerPosition?.x === x && playerPosition?.y === y ? (
                    <>🤠</>
                  ) : null}
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

Don't worry too much about all the extra markup and class names. It's there to separate the non-interactive terrain in the background from the moving entities (i.e. players) in the foreground.

Now that there's terrain on the map, we can make it more interesting by turning the boulders into obstructions (so that the player cannot walk through them) and the tall grass into a chance of encounter (just like in Pokémon).
