import { createWorld } from "@latticexyz/recs";
import { setupContracts, setupDevSystems } from "./setup";
import { createActionSystem, defineCoordComponent } from "@latticexyz/std-client";
import { GameConfig } from "./config";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config: GameConfig) {
  console.log("Network config", config);

  // --- WORLD ----------------------------------------------------------------------
  const world = createWorld();

  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Position: defineCoordComponent(world, { id: "Position", metadata: { contractId: "ember.component.position" } }),
  };

  // --- SETUP ----------------------------------------------------------------------
  const { txQueue, systems, txReduced$, network, startSync, encoders } = await setupContracts(
    config,
    world,
    components
  );

  // --- ACTION SYSTEM --------------------------------------------------------------
  const actions = createActionSystem(world, txReduced$);

  // --- API ------------------------------------------------------------------------
  function move(coord: Coord) {
    systems["ember.system.move"].executeTyped(BigNumber.from(network.connectedAddress.get()), coord);
  }

  // --- CONTEXT --------------------------------------------------------------------
  const context = {
    world,
    components,
    txQueue,
    systems,
    txReduced$,
    startSync,
    network,
    actions,
    api: { move },
    dev: setupDevSystems(world, encoders, systems),
  };

  return context;
}
