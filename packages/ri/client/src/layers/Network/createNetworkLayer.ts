import { Component, ComponentValue, createWorld, defineComponent, EntityIndex, Schema, Type } from "@latticexyz/recs";
import {
  definePositionComponent,
  defineEntityTypeComponent,
  defineMovableComponent,
  defineOwnedByComponent,
  defineUntraversableComponent,
} from "./components";
import { setupContracts } from "./setup";
import { CHECKPOINT_URL, DEV_PRIVATE_KEY, DIAMOND_ADDRESS, RPC_URL, RPC_WS_URL } from "./constants.local";
import { BigNumber } from "ethers";
import { keccak256 } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";
import { WorldCoord } from "../../types";
import { SetupContractConfig } from "./setup/setupContracts";
import { LOCAL_CHAIN_ID } from "../../constants";

export type NetworkLayerConfig = {
  contractAddress: string;
  privateKey: string;
  chainId: number;
  personaId: number;
  jsonRpc?: string;
  wsRpc?: string;
  checkpointUrl?: string;
  devMode: boolean;
};

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config?: NetworkLayerConfig) {
  // World
  const world = createWorld();

  //Config
  console.log("Config", config?.jsonRpc, config?.wsRpc);

  // Components
  const components = {
    GameConfig: defineComponent(
      world,
      { startTime: Type.String, turnLength: Type.String },
      { id: "GameConfig", metadata: { contractId: keccak256("ember.component.gameConfigComponent") } }
    ),
    Position: definePositionComponent(world, keccak256("ember.component.positionComponent")),
    EntityType: defineEntityTypeComponent(world, keccak256("ember.component.entityTypeComponent")),
    Movable: defineMovableComponent(world, keccak256("ember.component.movableComponent")),
    OwnedBy: defineOwnedByComponent(world, keccak256("ember.component.ownedByComponent")),
    Untraversable: defineUntraversableComponent(world, keccak256("ember.component.untraversableComponent")),
    Persona: defineComponent(
      world,
      { value: Type.String },
      { id: "Persona", metadata: { contractId: keccak256("ember.component.personaComponent") } }
    ),
    // Stamina
    Stamina: defineComponent(
      world,
      { current: Type.Number, max: Type.Number, regeneration: Type.Number },
      { id: "Stamina", metadata: { contractId: keccak256("ember.component.personaComponent") } }
    ),
    LastActionTurn: defineComponent(
      world,
      { value: Type.Number },
      { id: "LastActionTurn", metadata: { contractId: keccak256("ember.component.lastActionTurnComponent") } }
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
    [keccak256("ember.component.lastActionTurnComponent")]: "LastActionTurn",
    [keccak256("ember.component.gameConfigComponent")]: "GameConfig",
    [keccak256("ember.component.staminaComponent")]: "Stamina",
  };

  const contractConfig: SetupContractConfig = {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      jsonRpcUrl: config?.jsonRpc || RPC_URL,
      wsRpcUrl: config?.wsRpc || RPC_WS_URL,
      options: {
        batch: false,
      },
    },
    privateKey: config?.privateKey || DEV_PRIVATE_KEY,
    chainId: config?.chainId || LOCAL_CHAIN_ID,
    checkpointServiceUrl: config?.checkpointUrl || CHECKPOINT_URL,
    initialBlockNumber: 0,
  };

  const DEV_MODE = contractConfig.chainId === LOCAL_CHAIN_ID || config?.devMode;

  // Instantiate contracts and set up mappings
  const { txQueue, txReduced$, encoders, network, startSync } = await setupContracts(
    config?.contractAddress || DIAMOND_ADDRESS,
    contractConfig,
    world,
    components,
    mappings,
    DEV_MODE
  );

  async function setContractComponentValue<T extends Schema>(
    entity: EntityIndex,
    component: Component<T, { contractId: string }>,
    newValue: ComponentValue<T>
  ) {
    if (!DEV_MODE) throw new Error("Not allowed to directly edit Component values outside DEV_MODE");

    if (!component.metadata.contractId)
      throw new Error(
        `Attempted to set the contract value of Component ${component.id} without a deployed contract backing it.`
      );

    const data = encoders[component.id](newValue);
    const entityId = world.entities[entity];

    console.log(`Sent transaction to edit networked Component ${component.id} for Entity ${entityId}`);
    await txQueue.Game.addComponentToEntityExternally(BigNumber.from(entityId), component.metadata.contractId, data);
  }

  async function joinGame(position: WorldCoord) {
    console.log(`Joining game at position ${JSON.stringify(position)}`);
    return txQueue.Game.joinGame(position);
  }

  async function moveEntity(entity: string, targetPosition: WorldCoord) {
    console.log(`Moving entity ${entity} to position (${targetPosition.x}, ${targetPosition.y})}`);
    return txQueue.Game.moveEntity(BigNumber.from(entity), targetPosition);
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
    network,
    api: {
      setContractComponentValue,
      joinGame,
      moveEntity,
    },
    DEV_MODE,
  };
}
