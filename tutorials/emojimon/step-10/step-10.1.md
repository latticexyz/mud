---
order: -10.1
---

# 10.1. Encounter triggers

What would Emojimon be without tall grass?

Similar to obstructions, we can make our tall grass terrain type have a chance of triggering an encounter when you walk through it.

## Encounter trigger component

Another boolean component to indicate when an entity can trigger an encounter.

```sol packages/contracts/src/components/EncounterTriggerComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.EncounterTrigger"));

contract EncounterTriggerComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
```

```ts !#2-6 packages/client/src/mud/components.ts
export const contractComponents = {
  EncounterTrigger: defineBoolComponent(world, {
    metadata: {
      contractId: "component.EncounterTrigger",
    },
  }),
  MapConfig: defineComponent(
    world,
```

## Make tall grass a trigger

Like obstructions, we'll make an entity for each tall grass tile and give it a position and encounter trigger.

```sol !#3,11-13,22-26 packages/contracts/src/libraries/MapConfigInitializer.sol
import { PositionComponent, ID as PositionComponentID, Coord } from "components/PositionComponent.sol";
import { ObstructionComponent, ID as ObstructionComponentID } from "components/ObstructionComponent.sol";
import { EncounterTriggerComponent, ID as EncounterTriggerComponentID } from "components/EncounterTriggerComponent.sol";
import { TerrainType } from "../TerrainType.sol";

library MapConfigInitializer {
  function init(IWorld world) internal {
    …
    PositionComponent position = PositionComponent(world.getComponent(PositionComponentID));
    ObstructionComponent obstruction = ObstructionComponent(world.getComponent(ObstructionComponentID));
    EncounterTriggerComponent encounterTrigger = EncounterTriggerComponent(
      world.getComponent(EncounterTriggerComponentID)
    );
    …
    for (uint32 y = 0; y < height; y++) {
      for (uint32 x = 0; x < width; x++) {
        …
        if (terrainType == TerrainType.Boulder) {
          uint256 entity = world.getUniqueEntityId();
          position.set(entity, Coord(int32(x), int32(y)));
          obstruction.set(entity);
        } else if (terrainType == TerrainType.TallGrass) {
          uint256 entity = world.getUniqueEntityId();
          position.set(entity, Coord(int32(x), int32(y)));
          encounterTrigger.set(entity);
        }

```

And deploy it.

```json !#3 packages/contracts/deploy.json
{
  "components": [
    "EncounterTriggerComponent",
    "MapConfigComponent",
    "MovableComponent",
```
