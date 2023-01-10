import ReactDOM from "react-dom/client";
import { setupMUDNetwork } from "@latticexyz/std-client";
import { createWorld } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { defineNumberComponent } from "@latticexyz/std-client";
import { config } from "./config";
import { App } from "./App";
import { GodID as SingletonID } from "@latticexyz/network";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// The world contains references to all entities, all components and disposers.
const world = createWorld();
export const singletonIndex = world.registerEntity({ id: SingletonID });

// Components contain the application state.
// If a contractId is provided, MUD syncs the state with the corresponding
// component contract (in this case `CounterComponent.sol`)
export const components = {
  Counter: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Counter",
    },
  }),
};

// This is where the magic happens
setupMUDNetwork<typeof components, SystemTypes>(
  config,
  world,
  components,
  SystemAbis
).then(({ startSync, systems }) => {
  // After setting up the network, we can tell MUD to start the synchronization process.
  startSync();

  root.render(<App world={world} systems={systems} components={components} />);
});
