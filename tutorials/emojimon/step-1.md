---
order: -1
---

# 1. Create your first component and system

Most things (entities) in our game are going to be placed on a 2D map, things like players, terrain, and interactive tiles. We’ll represent this by creating a `Position` component that we can add to each entity. And we’ll create a `Move` system that we can call to move entities to a different position.

## Position component

Create a new file in `packages/contracts/src/components` called `PositionComponent.sol`. We can inherit from MUD’s `CoordComponent`.

```solidity packages/contracts/src/components/PositionComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/CoordComponent.sol";

uint256 constant ID = uint256(keccak256("component.Position"));

contract PositionComponent is CoordComponent {
  constructor(address world) CoordComponent(world, ID) {}
}

```

## Move system

Let’s also create a `MoveSystem.sol` in `packages/contracts/src/systems` to move our entities by updating their position component value.

In ECS, every “thing” in the world is an entity, and an entity is just an ID. Our game will have players, each represented as an entity with their own ID. Since each game client talks to the contracts via a wallet address (`msg.sender`), we can just use that as the entity ID. And MUD provides an `addressToEntity` helper for converting between an address and entity ID. This address-as-an-ID pattern will make our lives easier when updating the player’s component values and is also what MUD uses internally when registering components and systems.

```solidity packages/contracts/src/systems/MoveSystem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";

uint256 constant ID = uint256(keccak256("system.Move"));

contract MoveSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    return executeTyped(abi.decode(args, (Coord)));
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    position.set(entityId, coord);
  }
}

```

## Deployment config

Any time we add a component or system, we need to update the `deploy.json`, which MUD uses to deploy and connect our components and systems. Because we’re setting the `PositionComponent` value in our `MoveSystem`, we must also declare that it needs `writeAccess`.

(We no longer need the project template’s counter component or increment system, so we can remove those too.)

```json packages/deploy.json
{
  "components": ["PositionComponent"],
  "systems": [
    {
      "name": "MoveSystem",
      "writeAccess": ["PositionComponent"]
    }
  ]
}
```

There’s not much to see yet, so let’s get this wired up in the client next.
