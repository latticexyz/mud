---
order: -10.3
---

# 10.3. Random chance of encounter

Now we can make our tall grass do something!

## Make tall grass start an encounter

Like obstructions, we'll need to query if there are any encounter triggers at a particular location.

```sol !#2,7-12 packages/contracts/src/LibMap.sol
import { IWorld, WorldQueryFragment } from "solecs/World.sol";
import { ID as EncounterTriggerComponentID } from "components/EncounterTriggerComponent.sol";
import { ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
…
library LibMap {
  …
  function encounterTriggers(IWorld world, Coord memory coord) internal view returns (uint256[] memory) {
    WorldQueryFragment[] memory fragments = new WorldQueryFragment[](2);
    fragments[0] = WorldQueryFragment(QueryType.HasValue, PositionComponentID, abi.encode(coord));
    fragments[1] = WorldQueryFragment(QueryType.Has, EncounterTriggerComponentID, new bytes(0));
    return world.query(fragments);
  }
}
```

Now we can extend our move system to check if an entity at a position can start an encounter and add some randomness to it.

One important thing to note when building "chance" into smart contracts is that the EVM on its own is deterministic. That means there's no true source of randomness and is prone to being manipulated if the financial incentive is there. Since we're building a simple demonstration of MUD, we won't worry about that for now. For more robust randomness, look into oracles like [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction/) or stay tuned for future MUD tooling.

To get something that is pseudorandom, we'll take a hash of a few sources of entropy: an incrementing nonce, the entity being moved, the position it's moving to, and the block difficulty (now mapped to the `PREVRANDAO` opcode post-merge, an on-chain and block-level source of entropy).

```sol !#3-4,6,12-18,21-31 packages/contracts/src/systems/MoveSystem.sol
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { EncounterableComponent, ID as EncounterableComponentID } from "components/EncounterableComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
…
contract MoveSystem is System {
  uint256 internal entropyNonce = 1;
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    …
    position.set(entityId, coord);

    if (canTriggerEncounter(entityId, coord)) {
      // 20% chance to trigger encounter
      uint256 rand = uint256(keccak256(abi.encode(++entropyNonce, entityId, coord, block.difficulty)));
      if (rand % 5 == 0) {
        startEncounter(entityId);
      }
    }
  }

  function canTriggerEncounter(uint256 entityId, Coord memory coord) internal view returns (bool) {
    return
      // Check if entity can be encountered
      EncounterableComponent(getAddressById(components, EncounterableComponentID)).has(entityId) &&
      // Check if there are any encounter triggers at the entity's position
      LibMap.encounterTriggers(world, coord).length > 0;
  }

  function startEncounter(uint256 entityId) internal returns (uint256) {
    // TODO
  }
}
```

## Encounter component

To implement the `startEncounter` method, we'll need a way to associate a player (and eventually a monster) with a given encounter. We'll create a new entity ID to represent the encounter itself, and then an encounter component that stores that encounter ID on the player.

```sol packages/contracts/src/components/EncounterComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

uint256 constant ID = uint256(keccak256("component.Encounter"));

contract EncounterComponent is Uint256Component {
  constructor(address world) Uint256Component(world, ID) {}
}

```

Now we can fill in `startEncounter`.

```sol !#2,10-13 packages/contracts/src/systems/MoveSystem.sol
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { EncounterComponent, ID as EncounterComponentID } from "components/EncounterComponent.sol";
import { EncounterableComponent, ID as EncounterableComponentID } from "components/EncounterableComponent.sol";

uint256 constant ID = uint256(keccak256("system.Move"));

contract MoveSystem is System {
  …
  function startEncounter(uint256 entityId) internal returns (uint256) {
    uint256 encounterId = world.getUniqueEntityId();
    EncounterComponent encounter = EncounterComponent(getAddressById(components, EncounterComponentID));
    encounter.set(entityId, encounterId);
    return encounterId;
  }
}
```

Did you remember to update `deploy.json`?

```json !#3,13 packages/contracts/deploy.json
{
  "components": [
    "EncounterComponent",
    "EncounterableComponent",
    "EncounterTriggerComponent",
    …
  ],
  "initializers": ["MapConfigInitializer"],
  "systems": [
    …
    {
      "name": "MoveSystem",
      "writeAccess": ["EncounterComponent", "PositionComponent"]
    },
```

## Restrict movement

We don't want the player to be able to move around the map while they're in an encounter. So let's restrict their movement both in the move system and in the client.

Since we're working with ECS where components are behaviors, one way to implement this would be to remove the `Movable` component from the player once they enter an encounter. Once an encounter is over, we'd need to add back the `Movable` component, but only to the entities that had it previously.

To keep things simple and avoid juggling all that state, we'll add an extra check to our move system to prevent movement if you're in an encounter.

```sol !#8-9 packages/contracts/src/systems/MoveSystem.sol
contract MoveSystem is System {
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    …
    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    require(LibMap.distance(position.getValue(entityId), coord) == 1, "can only move to adjacent spaces");

    EncounterComponent encounter = EncounterComponent(getAddressById(components, EncounterComponentID));
    require(!encounter.has(entityId), "cannot move during an encounter");

    // Constrain position to map size, wrapping around if necessary
    MapConfig memory mapConfig = MapConfigComponent(getAddressById(components, MapConfigComponentID)).getValue();

```

We should add the same check to the client so that optimistic rendering can do its job.

You'll notice we've had to duplicate a bunch of logic in both our systems and the client for optimistic rendering. We're currently researching ways to simulate these transactions on the client, so that optimistic rendering for system calls will happen automatically.

```ts !#4,8-12 packages/client/src/mud/components.ts
import {
  defineBoolComponent,
  defineCoordComponent,
  defineStringComponent,
} from "@latticexyz/std-client";
…
export const contractComponents = {
  Encounter: defineStringComponent(world, {
    metadata: {
      contractId: "component.Encounter",
    },
  }),
  Encounterable: defineBoolComponent(world, {
    metadata: {
```

We use a string component here to represent the encounter ID to make it easier to work with in JS.

```ts !#10-15 packages/client/src/mud/setup.ts
export const setup = async () => {
  …
  const moveTo = async (x: number, y: number) => {
    …
    if (obstructed.size > 0) {
      console.warn("cannot move to obstructed space");
      return;
    }

    const inEncounter =
      getComponentValue(components.Encounter, playerEntity)?.value != null;
    if (inEncounter) {
      console.warn("cannot move while in encounter");
      return;
    }

    const positionId = uuid();
```

After restarting `mud dev`, you can start moving around in the tall grass and notice that you'll get stuck. If you check your browser console, you'll see it's because you're in an encounter!
