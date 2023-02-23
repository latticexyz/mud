# 7.1. Singleton component for map config

Before we start making the map more interesting with terrain, let's move the map configuration into ECS. We'll use this map config in our move system in future steps to check boundaries for movement and add behavior to different terrain types (e.g. tall grass).

We'll use the singleton pattern to create one value globally. Using ECS isn't strictly necessary here, but doing it now opens up the option of changing the map on the fly.

## Map config component

Because we have a very specific shape of data, we'll use a custom component for this. The main difference between this and the built-in component types is that we'll need to manually define the component schema. This is usually done for you when inheriting from e.g. `BoolComponent`. Defining the schema in our components allows the MUD networking stack to decode component data stored on chain.

```sol packages/contracts/src/components/MapConfigComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { BareComponent } from "solecs/BareComponent.sol";
import { LibTypes } from "solecs/LibTypes.sol";
import { SingletonID } from "solecs/SingletonID.sol";

uint256 constant ID = uint256(keccak256("component.MapConfig"));

struct MapConfig {
  uint32 width;
  uint32 height;
}

contract MapConfigComponent is BareComponent {
  constructor(address world) BareComponent(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "width";
    values[0] = LibTypes.SchemaValue.UINT32;

    keys[1] = "height";
    values[1] = LibTypes.SchemaValue.UINT32;
  }

  function set(MapConfig memory mapConfig) public {
    set(SingletonID, abi.encode(mapConfig.width, mapConfig.height));
  }

  function getValue() public view returns (MapConfig memory) {
    (uint32 width, uint32 height) = abi.decode(getRawValue(SingletonID), (uint32, uint32));
    return MapConfig(width, height);
  }
}

```

## Initialize map config

We can use the initializer pattern in MUD to set our map config on deploy. They exist as libraries with an internal `init` function that receives the `world` contract address.

```sol packages/contracts/src/libraries/MapConfigInitializer.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";

library MapConfigInitializer {
  function init(IWorld world) internal {
    MapConfigComponent(world.getComponent(MapConfigComponentID)).set(MapConfig({ width: 20, height: 20 }));
  }
}

```

Now we can add our new map config component and initializer to the `deploy.json` config. You may need to restart your `dev:contracts` service to redeploy contracts with the initializer.

```json !#2-3 packages/contracts/deploy.json
{
  "components": ["MapConfigComponent", "MovableComponent", "PlayerComponent", "PositionComponent"],
  "initializers": ["MapConfigInitializer"],
  "systems": [
```

## Map config on the client

Again, because this is a custom component, we need to define its schema on the client as part of its component definition.

```ts !#1,9-19 packages/client/src/mud/components.ts
+import { overridableComponent, defineComponent, Type } from "@latticexyz/recs";
import {
  defineBoolComponent,
  defineCoordComponent,
} from "@latticexyz/std-client";
import { world } from "./world";

export const contractComponents = {
  MapConfig: defineComponent(
    world,
    {
      width: Type.Number,
      height: Type.Number,
    },
    {
      id: "MapConfig",
      metadata: { contractId: "component.MapConfig" },
    }
  ),
  Movable: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Movable",
```

We'll use a new React hook for the map config, so we can ensure its value is present before using it. This makes types easier to work with downstream. Without the loading screen we added, using this hook would immediately throw an error.

```ts packages/client/src/useMapConfig.ts
import { getComponentValue } from "@latticexyz/recs";
import { useMUD } from "./MUDContext";

export const useMapConfig = () => {
  const {
    components: { MapConfig },
    singletonEntity,
  } = useMUD();

  const mapConfig = getComponentValue(MapConfig, singletonEntity);

  if (mapConfig == null) {
    throw new Error("game config not set or not ready, only use this hook after loading state === LIVE");
  }

  return mapConfig;
};
```

And now we can replace the hardcoded map dimensions in the game board with the new map config.

```tsx !#5,8-10 packages/client/src/GameBoard.tsx
import { useComponentValueStream } from "@latticexyz/std-client";
import { useMUD } from "./MUDContext";
import { useJoinGame } from "./useJoinGame";
import { useMovement } from "./useMovement";
import { useMapConfig } from "./useMapConfig";

export const GameBoard = () => {
  const { width, height } = useMapConfig();
  const rows = new Array(height).fill(0).map((_, i) => i);
  const columns = new Array(width).fill(0).map((_, i) => i);

  const {
    components: { Position },
    playerEntity,
  } = useMUD();
```
