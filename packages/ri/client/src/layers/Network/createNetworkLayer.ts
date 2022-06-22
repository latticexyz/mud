import { Component, ComponentValue, createWorld, defineComponent, Entity, Schema, Type } from "@latticexyz/recs";
import {
  definePositionComponent,
  defineEntityTypeComponent,
  defineMovableComponent,
  defineOwnedByComponent,
  defineUntraversableComponent,
} from "./components";
import { setupContracts } from "./setup";
import { CHECKPOINT_URL, DEV_PRIVATE_KEY, DIAMOND_ADDRESS, LAYER_NAME, RPC_URL, RPC_WS_URL } from "./constants.local";
import { BigNumber } from "ethers";
import { keccak256 } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";
import { WorldCoord } from "../../types";
import { SetupContractConfig } from "./setup/setupContracts";

export type NetworkLayerConfig = {
  contractAddress: string;
  privateKey: string;
  chainId: number;
  personaId: number;
};

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config?: NetworkLayerConfig) {
  // World
  const world = createWorld({ name: LAYER_NAME });

  // Components
  const components = {
    Position: definePositionComponent(world, keccak256("ember.component.positionComponent")),
    EntityType: defineEntityTypeComponent(world, keccak256("ember.component.entityTypeComponent")),
    Movable: defineMovableComponent(world, keccak256("ember.component.movableComponent")),
    OwnedBy: defineOwnedByComponent(world, keccak256("ember.component.ownedByComponent")),
    Untraversable: defineUntraversableComponent(world, keccak256("ember.component.untraversableComponent")),
    Persona: defineComponent(
      world,
      { value: Type.String },
      { name: "Persona", metadata: { contractId: keccak256("ember.component.personaComponent") } }
    ),
  };

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("ember.component.positionComponent")]: "Position",
    [keccak256("ember.component.entityTypeComponent")]: "EntityType",
    [keccak256("ember.component.movableComponent")]: "Movable",
    [keccak256("ember.component.ownedByComponent")]: "OwnedBy",
    [keccak256("ember.component.untraversableComponent")]: "Untraversable",
    [keccak256("ember.component.personaComponent")]: "Persona",
  };

  const contractConfig: SetupContractConfig = {
    clock: {
      period: 5000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      jsonRpcUrl: RPC_URL,
      wsRpcUrl: RPC_WS_URL,
      options: {
        batch: false,
      },
    },
    privateKey: config?.privateKey || DEV_PRIVATE_KEY,
    chainId: config?.chainId || 31337,
    checkpointServiceUrl: CHECKPOINT_URL,
    initialBlockNumber: 0,
  };

  // Instantiate contracts and set up mappings
  const { txQueue, txReduced$, encoders, startSync } = await setupContracts(
    config?.contractAddress || DIAMOND_ADDRESS,
    contractConfig,
    world,
    components,
    mappings
  );

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

    const data = encoders[component.id](newValue);

    console.log(`Sent transaction to edit networked Component ${component.id} for Entity ${entity}`);
    await txQueue.Game.addComponentToEntityExternally(BigNumber.from(entity), component.metadata.contractId, data);
  }

  async function joinGame(position: WorldCoord, entityType: number) {
    console.log(`Spawning creature at position ${JSON.stringify(position)}`);
    return txQueue.Game.joinGame(position, entityType);
  }

  async function moveEntity(entity: Entity, targetPosition: WorldCoord) {
    console.log(`Moving entity ${entity} to position (${targetPosition.x}, ${targetPosition.y})}`);
    return txQueue.Game.moveEntity(BigNumber.from(entity), targetPosition, { gasLimit: 400000 });
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
    startSync,
    personaId: config?.personaId,
    api: {
      setContractComponentValue,
      joinGame,
      moveEntity,
    },
  };
}
