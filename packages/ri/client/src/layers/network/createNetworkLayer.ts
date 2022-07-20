import { createWorld } from "@latticexyz/recs";
import { setupContracts, setupDevSystems } from "./setup";
import { createActionSystem, defineCoordComponent, defineStringComponent } from "@latticexyz/std-client";
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
    CarriedBy: defineStringComponent(world, { id: "CarriedBy", metadata: { contractId: "ember.component.carriedBy" } }),
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

  function kidnap(coord: Coord) {
    systems["ember.system.catch"].executeTyped(coord);
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
    api: { move, kidnap },
    dev: setupDevSystems(world, encoders, systems),
  };

  return context;
}
