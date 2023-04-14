import { setupMUDNetwork } from "@latticexyz/std-client";
import { createWorld } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { defineNumberComponent } from "@latticexyz/std-client";
import { config } from "./config";

// The world contains references to all entities, all components and disposers.
const world = createWorld();

// Components contain the application state.
// If a contractId is provided, MUD syncs the state with the corresponding
// component contract (in this case `CounterComponent.sol`)
const components = {
  Counter: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Counter",
    },
  }),
};

// Components expose a stream that triggers when the component is updated.
components.Counter.update$.subscribe(({ value }) => {
  document.getElementById("counter")!.innerHTML = String(value?.[0]?.value);
});

// This is where the magic happens
setupMUDNetwork<typeof components, SystemTypes>(config, world, components, SystemAbis).then(
  ({ startSync, systems }) => {
    // After setting up the network, we can tell MUD to start the synchronization process.
    startSync();

    // Just for demonstration purposes: we create a global function that can be
    // called to invoke the Increment system contract. (See IncrementSystem.sol.)
    (window as any).increment = () => systems["system.Increment"].executeTyped("0x00");
  }
);
