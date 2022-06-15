import { Component, ComponentValue, createWorld, Entity, Schema } from "@latticexyz/recs";
import { definePositionComponent, defineEntityTypeComponent } from "./components";
import { setupContracts } from "./setup";
import { LAYER_NAME } from "./constants.local";
import { BigNumber } from "ethers";
import { keccak256 } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";
import { Coord } from "@latticexyz/utils";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer() {
  // World
  const world = createWorld({ name: LAYER_NAME });

  // Components
  const components = {
    Position: definePositionComponent(world, keccak256("ember.component.positionComponent")),
    EntityType: defineEntityTypeComponent(world, keccak256("ember.component.entityTypeComponent")),
  };

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("ember.component.positionComponent")]: "Position",
    [keccak256("ember.component.entityTypeComponent")]: "EntityType",
  };

  // Instantiate contracts and set up mappings
  const { txQueue, txReduced$, encoders } = await setupContracts(world, components, mappings);

  /**
   * TODO Only include this function in dev mode.
   */
  async function setContractComponentValue<T extends Schema>(
    entity: Entity,
    component: Component<T, { contractId: string }>,
    newValue: ComponentValue<T>
  ) {
    if (!component.metadata.contractId)
      throw new Error(
        `Attempted to set the contract value of Component ${component.id} without a deployed contract backing it.`
      );

    const data = await encoders[component.id](newValue);

    console.log(`Sent transaction to edit networked Component ${component.id} for Entity ${entity}`);
    await txQueue.Game.addComponentToEntityExternally(BigNumber.from(entity), component.metadata.contractId, data);
  }

  async function spawnCreature(position: Coord) {
    console.log(`Spawning creature at position ${JSON.stringify(position)}`);
    await txQueue.Game.spawnCreature(position);
  }

  // Constants (load from contract later)
  const constants = {
    mapSize: 50,
  };

  return {
    world,
    components,
    constants,
    txQueue,
    txReduced$,
    mappings,
    api: {
      setContractComponentValue,
      spawnCreature,
    },
  };
}
