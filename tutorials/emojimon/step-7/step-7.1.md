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
import { SingletonID } from "../SingletonID.sol";

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

  function isSet() public view returns (bool) {
    return has(SingletonID);
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

## Init system

Since components are only written to by systems, we'll need one to initialize the map config.

```sol packages/contracts/src/systems/InitSystem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";

uint256 constant ID = uint256(keccak256("system.Init"));

contract InitSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory data) public returns (bytes memory) {
    MapConfigComponent mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID));
    if (mapConfig.isSet()) return new bytes(0);

    mapConfig.set(MapConfig({ width: 10, height: 10 }));
  }
}

```

Usually it's the client calling systems. We don't want anyone else overwriting our map once initialized, so the system checks if the component `isSet` before anything else. Ideally, we want the init system to be called when we deploy the contracts, so that the map is ready to go once everything is deployed.

We can use the `initialize` key in our deploy config to do this. Its value is passed as calldata to `execute`. Since we don't have any data to pass in, we'll use an empty `bytes` value.

```json !#2,4-8 packages/contracts/deploy.json
{
  "components": ["MapConfigComponent", "MovableComponent", "PlayerComponent", "PositionComponent"],
  "systems": [
    {
      "name": "InitSystem",
      "writeAccess": ["MapConfigComponent"],
      "initialize": "new bytes(0)"
    },
    {
      "name": "JoinGameSystem",
      "writeAccess": ["MovableComponent", "PlayerComponent", "PositionComponent"]
```

## Map config on the client

Again, because this is a custom component, we need to define its schema on the client as part of its component definition.

```ts !#1,9-19 packages/client/src/mud/components.ts
import { defineComponent, Type } from "@latticexyz/recs";
import {
  defineBoolComponent,
  defineCoordComponent,
} from "@latticexyz/std-client";
import { world } from "./world";

export const components = {
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
