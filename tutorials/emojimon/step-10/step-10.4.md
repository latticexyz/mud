---
order: -10.4
---

# 10.4. Spawn monster in encounter

Our player is in an encounter, but with no opponent. Let's fix that by spawning a monster.

## Monster types

Just like the terrain, we'll add a set of monster types that we can use in our contracts and client.

```sol packages/contracts/src/MonsterType.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

enum MonsterType {
  None,
  Eagle,
  Rat,
  Caterpillar
}

```

```ts packages/client/src/monsterTypes.ts
export enum MonsterType {
  Eagle = 1,
  Rat,
  Caterpillar,
}

type MonsterConfig = {
  name: string;
  emoji: string;
};

export const monsterTypes: Record<MonsterType, MonsterConfig> = {
  [MonsterType.Eagle]: {
    name: "Eagle",
    emoji: "🦅",
  },
  [MonsterType.Rat]: {
    name: "Rat",
    emoji: "🐀",
  },
  [MonsterType.Caterpillar]: {
    name: "Caterpillar",
    emoji: "🐛",
  },
};
```

## Monster type component

Unlike terrain, we'll need to create entities to represent monsters. So we'll need a monster type component to identify them. For now, this is just visual, but you may decide to extend the logic to give different monsters unique behaviors.

We'll use a `uint32` component for the monster type. It's probably overkill for this purpose, but MUD doesn't have super optimized storage yet (i.e. bitpacking), so it doesn't matter.

```sol packages/contracts/src/components/MonsterTypeComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { MonsterType } from "../MonsterType.sol";

uint256 constant ID = uint256(keccak256("component.MonsterType"));

contract MonsterTypeComponent is Uint32Component {
  constructor(address world) Uint32Component(world, ID) {}

  function set(uint256 entity, MonsterType value) public {
    set(entity, abi.encode(value));
  }

  function getValueTyped(uint256 entity) public view returns (MonsterType) {
    return abi.decode(getRawValue(entity), (MonsterType));
  }
}

```

```ts !#4,10-14 packages/client/src/mud/components.ts
import {
  defineBoolComponent,
  defineCoordComponent,
  defineNumberComponent,
  defineStringComponent,
} from "@latticexyz/std-client";
…
export const components = {
  …
  MonsterType: defineNumberComponent(world, {
    metadata: {
      contractId: "component.MonsterType",
    },
  }),
  Movable: defineBoolComponent(world, {
    metadata: {
```

## Spawn monster into encounter

Let's pick a random monster type to spawn into the encounter with the player. Although it's not perfectly random, we'll use the same randomness approach for picking the monster that we used for triggering the encounter.

```sol !#4,7,16-20 packages/contracts/src/systems/MoveSystem.sol
import { MovableComponent, ID as MovableComponentID } from "components/MovableComponent.sol";
import { EncounterableComponent, ID as EncounterableComponentID } from "components/EncounterableComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "components/EncounterComponent.sol";
import { MonsterTypeComponent, ID as MonsterTypeComponentID } from "components/MonsterTypeComponent.sol";
import { MapConfigComponent, ID as MapConfigComponentID, MapConfig } from "components/MapConfigComponent.sol";
import { LibMap } from "../LibMap.sol";
import { MonsterType } from "../MonsterType.sol";
…
contract MoveSystem is System {
  …
  function startEncounter(uint256 entityId, uint256 rand) internal returns (uint256) {
    uint256 encounterId = world.getUniqueEntityId();
    EncounterComponent encounter = EncounterComponent(getAddressById(components, EncounterComponentID));
    encounter.set(entityId, encounterId);

    uint256 monsterId = world.getUniqueEntityId();
    uint256 rand = uint256(keccak256(abi.encode(++entropyNonce, entityId, encounterId, monsterId, block.difficulty)));
    MonsterType monsterType = MonsterType((rand % uint256(type(MonsterType).max)) + 1);
    MonsterTypeComponent(getAddressById(components, MonsterTypeComponentID)).set(monsterId, monsterType);
    encounter.set(monsterId, encounterId);

    return encounterId;
  }
}
```

And make sure we can deploy it.

```json !#5,13 packages/contracts/deploy.json
{
  "components": [
    …
    "MapConfigComponent",
    "MonsterTypeComponent",
    "MovableComponent",
    …
  ],
  "systems": [
    …
    {
      "name": "MoveSystem",
      "writeAccess": ["EncounterComponent", "MonsterTypeComponent", "PositionComponent"]
    }
  ]
}
```
