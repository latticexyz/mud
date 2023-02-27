---
order: -10.2
---

# 10.2. Make players encounterable

We could assume that player entities are always encounterable, but it's easier to compose components and create new types of entities or mechanics if we make them each component a small unit of behavior with as few assumptions as possible. So let's make an "encounterable" component.

## Encounterable component

You're probably getting good at creating these by now. Remember all the steps?

```sol packages/contracts/src/components/EncounterableComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.Encounterable"));

contract EncounterableComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}

```

```ts !#2-6 packages/client/src/mud/components.ts
export const contractComponents = {
  Encounterable: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Encounterable",
    },
  }),
  EncounterTrigger: defineBoolComponent(world, {
    metadata: {
```

## Update join system

We initialize the player within the join system, so we need to update that to add our new component to the player.

```sol !#2,11 packages/contracts/src/systems/JoinGameSystem.sol
import { getAddressById } from "solecs/utils.sol";
import { EncounterableComponent, ID as EncounterableComponentID } from "components/EncounterableComponent.sol";
import { PlayerComponent, ID as PlayerComponentID } from "components/PlayerComponent.sol";
…
contract JoinGameSystem is System {
  …
  function executeTyped(Coord memory coord) public returns (bytes memory) {
    …
    PositionComponent(getAddressById(components, PositionComponentID)).set(entityId, coord);
    MovableComponent(getAddressById(components, MovableComponentID)).set(entityId);
    EncounterableComponent(getAddressById(components, EncounterableComponentID)).set(entityId);
  }
}
```

```json !#3,12 packages/contracts/deploy.json
{
  "components": [
    "EncounterableComponent",
    "EncounterTriggerComponent",
    "MapConfigComponent",
    …
  ],
  "initializers": ["MapConfigInitializer"],
  "systems": [
    {
      "name": "JoinGameSystem",
      "writeAccess": ["EncounterableComponent", "MovableComponent", "PlayerComponent", "PositionComponent"]
    },
```
