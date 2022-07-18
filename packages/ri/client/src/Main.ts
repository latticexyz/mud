import { createWorld } from "@latticexyz/recs";
import { definePositionComponent } from "./components";
import { setupContracts, setupDevSystems } from "./setup";
import { BigNumber } from "ethers";
import { Coord, keccak256 } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";
import { createActionSystem } from "@latticexyz/std-client";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { GameConfig, phaserConfig } from "./config";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function Main(config: GameConfig) {
  console.log("Game config", config);

  // World
  const world = createWorld();

  // Components
  const components = {
    Position: definePositionComponent(world, keccak256("ember.component.positionComponent")),
  };

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("ember.component.position")]: "Position",
  };

  // Instantiate contracts and set up mappings
  const { txQueue, systems, txReduced$, network, startSync, encoders } = await setupContracts(
    config,
    world,
    components,
    mappings
  );

  // Create action queue
  const actions = createActionSystem(world, txReduced$);

  // Setup phaser renderer
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(phaserConfig);
  world.registerDisposer(disposePhaser);

  // API
  async function move(entity: string, coord: Coord) {
    console.log(`calling move ${entity}`);
    return systems["ember.system.move"].executeTyped(BigNumber.from(entity), coord);
  }

  return {
    world,
    components,
    txQueue,
    systems,
    txReduced$,
    mappings,
    startSync,
    network,
    game,
    scenes,
    actions,
    api: {
      move,
    },
    dev: setupDevSystems(world, encoders, systems),
  };
}
