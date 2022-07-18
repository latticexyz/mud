import { createWorld } from "@latticexyz/recs";
import { definePositionComponent } from "./components";
import { setupContracts } from "./setup";
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
  const { txQueue, systems, txReduced$, network, startSync } = await setupContracts(
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
    actions,
    api: {
      move,
    },
  };
}

// TODO: integrate:
// async function setContractComponentValue<T extends Schema>(
//   entity: EntityIndex,
//   component: Component<T, { contractId: string }>,
//   newValue: ComponentValue<T>
// ) {
//   if (!DEV_MODE) throw new Error("Not allowed to directly edit Component values outside DEV_MODE");

//   if (!component.metadata.contractId)
//     throw new Error(
//       `Attempted to set the contract value of Component ${component.id} without a deployed contract backing it.`
//     );

//   const data = (await encoders)[component.metadata.contractId](newValue);
//   const entityId = world.entities[entity];

//   console.log(`Sent transaction to edit networked Component ${component.id} for Entity ${entityId}`);
//   await systems["ember.system.componentDev"].executeTyped(
//     component.metadata.contractId,
//     BigNumber.from(entityId),
//     data
//   );
// }
