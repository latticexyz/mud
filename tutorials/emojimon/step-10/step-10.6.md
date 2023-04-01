---
order: -10.6
---

# 10.6. Throw emojiball

What would an Emojimon battle be without throwing emojiballs?

Let's make a new "throw" system to handle the logic of throwing an emojiball at a monster. And logic to "catch" the monster, making your player the owner of it. We should also track the number of throws, so the monster can flee after a certain number.

We can use MUD's system call stream to determine the outcome of a "throw" action based on the component updates from that system call.

## Owned by component

To catch a monster, we need a way to associate ownership of an entity (e.g. monster) with another entity (e.g. player). We'll model this with an `OwnedBy` component using the owner's entity ID for its value.

```sol packages/contracts/src/components/OwnedByComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

uint256 constant ID = uint256(keccak256("component.OwnedBy"));

contract OwnedByComponent is Uint256Component {
  constructor(address world) Uint256Component(world, ID) {}
}

```

```ts !#3-7 packages/client/src/mud/components.ts
export const contractComponents = {
  …
  OwnedBy: defineStringComponent(world, {
    metadata: {
      contractId: "component.OwnedBy",
    },
  }),
  Player: defineBoolComponent(world, {
    metadata: {
      contractId: "component.Player",
```

## Throw system

Now let's add a system to "throw" an emojiball at a monster. To keep it simple, we'll let the player throw as many emojiballs as they want. Maybe you could extend your game with an inventory and make emojiballs consumable?

Since we know the encounter ID and we know that only one monster is spawned per encounter, we could query for the monster in the encounter ID. But to keep our Solidity simpler, and to make it easier to extend to more than one monster per encounter, we'll require passing the monster ID into the system call.

```sol packages/contracts/src/systems/EncounterThrowSystem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { EncounterComponent, ID as EncounterComponentID } from "components/EncounterComponent.sol";
import { ID as MonsterTypeComponentID } from "components/MonsterTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

uint256 constant ID = uint256(keccak256("system.EncounterThrow"));

contract EncounterThrowSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 encounterId, uint256 monsterId) = abi.decode(args, (uint256, uint256));
    return executeTyped(encounterId, monsterId);
  }

  function executeTyped(uint256 encounterId, uint256 monsterId) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    EncounterComponent encounter = EncounterComponent(getAddressById(components, EncounterComponentID));
    require(encounter.getValue(entityId) == encounterId, "not in this encounter");
    require(encounter.getValue(monsterId) == encounterId, "monster not in this encounter");

    uint256 rand = uint256(keccak256(abi.encode(encounterId, entityId, monsterId, block.difficulty)));
    if (rand % 2 == 0) {
      // 50% chance to catch monster
      OwnedByComponent ownedBy = OwnedByComponent(getAddressById(components, OwnedByComponentID));
      ownedBy.set(monsterId, entityId);
      encounter.remove(monsterId);
      encounter.remove(entityId);
    } else {
      // Throw missed!
    }
  }
}

```

```json !#5,11-14 packages/contracts/deploy.json
{
  "components": [
    …
    "ObstructionComponent",
    "OwnedByComponent",
    "PlayerComponent",
    …
  ],
  "initializers": ["MapConfigInitializer"],
  "systems": [
    {
      "name": "EncounterThrowSystem",
      "writeAccess": ["EncounterComponent", "OwnedByComponent"]
    },
    {
      "name": "JoinGameSystem",
```

## Monster escapes

If you miss too many times, the monster should escape. To do this, we'll track how many actions have been taken in the encounter and let the monster escape after a certain number of actions.

It looks like we'll need that counter component after all!

```sol packages/contracts/src/components/CounterComponent.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

uint256 constant ID = uint256(keccak256("component.Counter"));

contract CounterComponent is Uint256Component {
  constructor(address world) Uint256Component(world, ID) {}
}

```

```ts !#2-6 packages/client/src/mud/components.ts
export const contractComponents = {
  Counter: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Counter",
    },
  }),
  Encounter: defineStringComponent(world, {
    metadata: {
```

Now we can wire up an action counter for the throw system.

```sol !#2,14-16,18,25-28 packages/contracts/src/systems/EncounterThrowSystem.sol
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { CounterComponent, ID as CounterComponentID } from "components/CounterComponent.sol";
import { EncounterComponent, ID as EncounterComponentID } from "components/EncounterComponent.sol";
…
contract EncounterThrowSystem is System {
  …
  function executeTyped(uint256 encounterId, uint256 monsterId) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    EncounterComponent encounter = EncounterComponent(getAddressById(components, EncounterComponentID));
    require(encounter.getValue(entityId) == encounterId, "not in this encounter");
    require(encounter.getValue(monsterId) == encounterId, "monster not in this encounter");

    CounterComponent counter = CounterComponent(getAddressById(components, CounterComponentID));
    uint256 actionCount = counter.has(encounterId) ? counter.getValue(encounterId) : 0;
    counter.set(encounterId, ++actionCount);

    uint256 rand = uint256(keccak256(abi.encode(encounterId, entityId, monsterId, actionCount, block.difficulty)));
    if (rand % 2 == 0) {
      // 50% chance to catch monster
      OwnedByComponent ownedBy = OwnedByComponent(getAddressById(components, OwnedByComponentID));
      ownedBy.set(monsterId, entityId);
      encounter.remove(monsterId);
      encounter.remove(entityId);
    } else if (actionCount > 2) {
      // Missed 2 times, monster escapes
      encounter.remove(monsterId);
      encounter.remove(entityId);
    } else {
      // Throw missed!
    }
  }
}

```

```json !#3,11 packages/contracts/deploy.json
{
  "components": [
    "CounterComponent",
    "EncounterComponent",
    …
  ],
  "initializers": ["MapConfigInitializer"],
  "systems": [
    {
      "name": "EncounterThrowSystem",
      "writeAccess": ["CounterComponent", "EncounterComponent", "OwnedByComponent"]
    },
```

## Enable system call stream

To determine if the monster was caught, escaped, or if we missed, we'll listen to component updates from the system call stream.

To use the system call stream, we'll need to enable it first. It's off by default in MUD because it can be a drain on performance without the stream service running (a topic for another guide). Our game is small enough that this shouldn't be a problem, though.

```ts !#7-9 packages/client/src/mud/setup.ts
export const setup = async () => {
  const result = await setupMUDNetwork<typeof contractComponents, SystemTypes>(
    config,
    world,
    contractComponents,
    SystemAbis,
    {
      fetchSystemCalls: true,
    }
  );
```

## Add throw button

The encounter screen is ready for a "throw" button. We'll create a new helper method using the system call stream and then we'll create a "toast" using [react-toastify](https://github.com/fkhadra/react-toastify) to help us communicate to the user that there's a pending action and the result of that action.

```ts !#3,7-41,49 packages/client/src/mud/setup.ts
import { uuid } from "@latticexyz/utils";
import { Has, HasValue, runQuery } from "@latticexyz/recs";
import { filter, first } from "rxjs";
…
export const setup = async () => {
  …
  const throwBall = async (encounterId: EntityID, monsterId: EntityID) => {
    const tx = await result.systems["system.EncounterThrow"].executeTyped(
      encounterId,
      monsterId
    );

    return new Promise<{ status: "caught" | "fled" | "missed"; tx: typeof tx }>(
      (resolve) => {
        result.systemCallStreams["system.EncounterThrow"]
          .pipe(filter((systemCall) => systemCall.tx.hash === tx.hash))
          .pipe(first())
          .subscribe((systemCall) => {
            const isCaught = systemCall.updates.some(
              (update) =>
                update.component.metadata?.contractId === "component.OwnedBy"
            );
            if (isCaught) {
              resolve({ status: "caught", tx });
              return;
            }

            const hasFled = systemCall.updates.some(
              (update) =>
                update.component.metadata?.contractId === "component.Encounter"
            );
            if (hasFled) {
              resolve({ status: "fled", tx });
              return;
            }

            resolve({ status: "missed", tx });
          });
      }
    );
  };

  return {
    …
    api: {
      moveTo,
      moveBy,
      joinGame,
      throwBall,
    },
  };
}
```

```tsx !#3,9,22-58 packages/client/src/EncounterScreen.tsx
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
…
export const EncounterScreen = ({ encounterId }: Props) => {
  const {
    world,
    components: { Encounter, MonsterType },
    api: { throwBall },
  } = useMUD();
  …
  return (
    <div
      className={twMerge(
        "flex flex-col gap-10 items-center justify-center bg-black text-white transition-opacity duration-1000",
        appear ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="text-8xl animate-bounce">{monster.monster.emoji}</div>
      <div>A wild {monster.monster.name} appears!</div>

      <div className="flex gap-2">
        <button
          type="button"
          className="bg-stone-600 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            const toastId = toast.loading("Throwing emojiball…");
            const { status } = await throwBall(encounterId, monster.entityId);
            if (status === "caught") {
              toast.update(toastId, {
                isLoading: false,
                type: "success",
                render: `You caught the ${monster.monster.name}!`,
                autoClose: 5000,
                closeButton: true,
              });
            } else if (status === "fled") {
              toast.update(toastId, {
                isLoading: false,
                type: "error",
                render: `Oh no, the ${monster.monster.name} fled!`,
                autoClose: 5000,
                closeButton: true,
              });
            } else {
              toast.update(toastId, {
                isLoading: false,
                type: "error",
                render: "You missed!",
                autoClose: 5000,
                closeButton: true,
              });
            }
          }}
        >
          ☄️ Throw
        </button>
      </div>
    </div>
  );
};
```

When you click the button, we create a toast and call the throw system. We use the transaction hash from the system call to find the same transaction in the system call stream. We subscribe to the call stream, wait for the correct transaction, then determine the outcome of the system call by looking at the different component updates.

If the owned by component changes, we'll assume the monster was caught. If the encounter component changes (i.e. something was removed from the encounter), we'll assume the monster fled. Otherwise, we probably missed.
