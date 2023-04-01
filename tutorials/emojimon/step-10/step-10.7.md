---
order: -10.7
---

# 10.7. Run away

Alongside our "throw" button, let's build a "run away" button to flee the encounter.

## Flee system

Just like the throw system, we'll add a flee system. To keep it simple, we won't use any randomness with this - when you want to flee, you can. Maybe you'll want to add a chance of "you can't run away"?

```sol packages/contracts/src/systems/EncounterFleeSystem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { EncounterComponent, ID as EncounterComponentID } from "components/EncounterComponent.sol";

uint256 constant ID = uint256(keccak256("system.EncounterFlee"));

contract EncounterFleeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 encounterId = abi.decode(args, (uint256));
    return executeTyped(encounterId);
  }

  function executeTyped(uint256 encounterId) public returns (bytes memory) {
    uint256 entityId = addressToEntity(msg.sender);

    EncounterComponent encounter = EncounterComponent(getAddressById(components, EncounterComponentID));
    require(encounter.getValue(entityId) == encounterId, "not in this encounter");

    encounter.remove(entityId);
  }
}

```

```json !#4-7 packages/contracts/deploy.json
{
  …
  "systems": [
    {
      "name": "EncounterFleeSystem",
      "writeAccess": ["EncounterComponent"]
    },
    {
      "name": "EncounterThrowSystem",
```

## Add run button

Since our flee system always allows you to run away, we technically don't need to listen for system call updates to determine the outcome. But doing so will help our UI and toasts stay in sync with component updates.

Because the encounter screen is shown only when you're in an encounter, you'll see that it will automatically disappear when you run away. This is the nice thing about MUD and declarative, responsive UI!

```ts !#3-15,24 packages/client/src/mud/setup.ts
export const setup = async () => {
  …
  const fleeEncounter = async (encounterId: EntityID) => {
    const tx = await result.systems["system.EncounterFlee"].executeTyped(
      encounterId
    );
    return new Promise<{ tx: typeof tx }>((resolve) => {
      result.systemCallStreams["system.EncounterFlee"]
        .pipe(filter((systemCall) => systemCall.tx.hash === tx.hash))
        .pipe(first())
        .subscribe(() => {
          resolve({ tx });
        });
    });
  };

  return {
    …
    api: {
      moveTo,
      moveBy,
      joinGame,
      throwBall,
      fleeEncounter,
    },
  };
}
```

```tsx !#20-36 packages/client/src/EncounterScreen.tsx
export const EncounterScreen = ({ encounterId }: Props) => {
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
          …
        >
          ☄️ Throw
        </button>
        <button
          type="button"
          className="bg-stone-800 hover:ring rounded-lg px-4 py-2"
          onClick={async () => {
            const toastId = toast.loading("Running away…");
            await fleeEncounter(encounterId);
            toast.update(toastId, {
              isLoading: false,
              type: "default",
              render: `You ran away!`,
              autoClose: 5000,
              closeButton: true,
            });
          }}
        >
          🏃‍♂️ Run
        </button>
      </div>
    </div>
  );
};
```
