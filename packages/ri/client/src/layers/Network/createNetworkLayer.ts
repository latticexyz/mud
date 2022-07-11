import {
  Component,
  ComponentValue,
  createWorld,
  defineComponent,
  EntityID,
  EntityIndex,
  Schema,
  Type,
} from "@latticexyz/recs";
import {
  definePositionComponent,
  defineEntityTypeComponent,
  defineMovableComponent,
  defineOwnedByComponent,
  defineUntraversableComponent,
} from "./components";
import { setupContracts } from "./setup";
import { CHECKPOINT_URL, DEV_PRIVATE_KEY, RPC_URL, RPC_WS_URL } from "./constants.local";
import { BigNumber } from "ethers";
import { keccak256 } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";
import { WorldCoord } from "../../types";
import { SetupContractConfig } from "./setup/setupContracts";
import { LOCAL_CHAIN_ID } from "../../constants";
import { defineStringComponent } from "@latticexyz/std-client";

export type NetworkLayerConfig = {
  worldAddress: string;
  privateKey: string;
  chainId: number;
  jsonRpc?: string;
  wsRpc?: string;
  checkpointUrl?: string;
  devMode: boolean;
};

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config: NetworkLayerConfig) {
  // World
  const world = createWorld();

  //Config
  console.log("Network config", config);

  // Components
  const components = {
    GameConfig: defineComponent(
      world,
      { startTime: Type.String, turnLength: Type.String },
      { id: "GameConfig", metadata: { contractId: keccak256("ember.component.gameConfigComponent") } }
    ),
    Components: defineStringComponent(world, {
      id: "Components",
      metadata: { contractId: keccak256("world.component.components") },
    }),
    Systems: defineStringComponent(world, {
      id: "Systems",
      metadata: { contractId: keccak256("world.component.systems") },
    }),
    Position: definePositionComponent(world, keccak256("ember.component.positionComponent")),
    EntityType: defineEntityTypeComponent(world, keccak256("ember.component.entityTypeComponent")),
    Movable: defineMovableComponent(world, keccak256("ember.component.movableComponent")),
    OwnedBy: defineOwnedByComponent(world, keccak256("ember.component.ownedByComponent")),
    Untraversable: defineUntraversableComponent(world, keccak256("ember.component.untraversableComponent")),
    Player: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Player", metadata: { contractId: keccak256("ember.component.playerComponent") } }
    ),
    Stamina: defineComponent(
      world,
      { current: Type.Number, max: Type.Number, regeneration: Type.Number },
      { id: "Stamina", metadata: { contractId: keccak256("ember.component.staminaComponent") } }
    ),
    LastActionTurn: defineComponent(
      world,
      { value: Type.Number },
      { id: "LastActionTurn", metadata: { contractId: keccak256("ember.component.lastActionTurnComponent") } }
    ),
    Health: defineComponent(
      world,
      { current: Type.Number, max: Type.Number },
      { id: "Health", metadata: { contractId: keccak256("ember.component.healthComponent") } }
    ),
    Attack: defineComponent(
      world,
      { strength: Type.Number, range: Type.Number },
      { id: "Attack", metadata: { contractId: keccak256("ember.component.attackComponent") } }
    ),
    PrototypeCopy: defineComponent(
      world,
      { value: Type.Entity },
      { id: "PrototypeCopy", metadata: { contractId: keccak256("ember.component.prototypeCopy") } }
    ),
    Prototype: defineComponent(
      world,
      { value: Type.StringArray },
      { id: "Prototype", metadata: { contractId: keccak256("ember.component.prototype") } }
    ),
  };

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("world.component.components")]: "Components",
    [keccak256("world.component.systems")]: "Systems",
    [keccak256("ember.component.gameConfigComponent")]: "GameConfig",
    [keccak256("ember.component.positionComponent")]: "Position",
    [keccak256("ember.component.entityTypeComponent")]: "EntityType",
    [keccak256("ember.component.movableComponent")]: "Movable",
    [keccak256("ember.component.ownedByComponent")]: "OwnedBy",
    [keccak256("ember.component.untraversableComponent")]: "Untraversable",
    [keccak256("ember.component.lastActionTurnComponent")]: "LastActionTurn",
    [keccak256("ember.component.staminaComponent")]: "Stamina",
    [keccak256("ember.component.playerComponent")]: "Player",
    [keccak256("ember.component.healthComponent")]: "Health",
    [keccak256("ember.component.attackComponent")]: "Attack",
    [keccak256("ember.component.prototype")]: "Prototype",
    [keccak256("ember.component.prototypeCopy")]: "PrototypeCopy",
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
  const { txQueue, systems, txReduced$, encoders, network, startSync } = await setupContracts(
    config.worldAddress,
    contractConfig,
    world,
    components.Systems,
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
    await systems["ember.system.componentDev"].executeTyped(
      component.metadata.contractId,
      BigNumber.from(entityId),
      data
    );
  }

  async function joinGame(position: WorldCoord) {
    console.log(`Joining game at position ${JSON.stringify(position)}`);
    return systems["ember.system.playerJoin"].executeTyped(position, { gasPrice: 0 });
  }

  async function moveEntity(entity: string, path: WorldCoord[]) {
    console.log(`Moving entity ${entity} to position (${path[path.length - 1].x}, ${path[path.length - 1].y})}`);
    return systems["ember.system.move"].executeTyped(BigNumber.from(entity), path, { gasPrice: 0 });
  }

  async function attackEntity(attacker: EntityID, defender: EntityID) {
    console.log(`Entity ${attacker} attacking ${defender}.`);
    return systems["ember.system.combat"].executeTyped(BigNumber.from(attacker), BigNumber.from(defender));
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
    systems,
    txReduced$,
    mappings,
    startSync,
    network,
    api: {
      setContractComponentValue,
      joinGame,
      moveEntity,
      attackEntity,
    },
    DEV_MODE,
  };
}
