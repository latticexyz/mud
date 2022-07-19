import { createWorld } from "@latticexyz/recs";
import { setupContracts, setupDevSystems } from "./setup";
import { BigNumber } from "ethers";
import { Coord } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";
import { createActionSystem } from "@latticexyz/std-client";
import { GameConfig } from "./config";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config: GameConfig) {
  console.log("Network config", config);

  // --- WORLD ----------------------------------------------------------------------
  const world = createWorld();

  // --- COMPONENTS -----------------------------------------------------------------
  const components = {};

  // --- CONTRACT / CLIENT MAPPING --------------------------------------------------
  const mappings: Mappings<typeof components> = {};

  // --- SETUP ----------------------------------------------------------------------
  const { txQueue, systems, txReduced$, network, startSync, encoders } = await setupContracts(
    config,
    world,
    components,
    mappings
  );

  // --- ACTION SYSTEM --------------------------------------------------------------
  const actions = createActionSystem(world, txReduced$);

  // --- API ------------------------------------------------------------------------
  async function move(coord: Coord) {
    console.log(`calling move`);
    return systems["ember.system.move"].executeTyped(BigNumber.from(network.connectedAddress.get()), coord);
  }

  // --- CONTEXT --------------------------------------------------------------------
  const context = {
    world,
    components,
    txQueue,
    systems,
    txReduced$,
    mappings,
    startSync,
    network,
    actions,
    api: {
      move,
    },
    dev: setupDevSystems(world, encoders, systems),
  };

  return context;
}
