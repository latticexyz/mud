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
  defineMovableComponent,
  defineOwnedByComponent,
  defineUntraversableComponent,
} from "./components";
import { setupContracts } from "./setup";
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
  jsonRpc: string;
  wsRpc?: string;
  checkpointUrl?: string;
  devMode: boolean;
  initialBlockNumber: number;
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
    UnitType: defineComponent(
      world,
      { value: Type.Number },
      { id: "UnitType", metadata: { contractId: keccak256("ember.component.unitType") } }
    ),
    StructureType: defineComponent(
      world,
      { value: Type.Number },
      { id: "StructureType", metadata: { contractId: keccak256("ember.component.structureType") } }
    ),
    ItemType: defineComponent(
      world,
      { value: Type.Number },
      { id: "ItemType", metadata: { contractId: keccak256("ember.component.itemType") } }
    ),
    TerrainType: defineComponent(
      world,
      { value: Type.Number },
      { id: "TerrainType", metadata: { contractId: keccak256("ember.component.terrainType") } }
    ),
    Position: definePositionComponent(world, keccak256("ember.component.positionComponent")),
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
    Factory: defineComponent(
      world,
      { prototypeIds: Type.StringArray, costs: Type.NumberArray, costItemTypes: Type.NumberArray },
      { id: "Factory", metadata: { contractId: keccak256("ember.component.factoryComponent") } }
    ),
    Capturable: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Capturable", metadata: { contractId: keccak256("ember.component.capturable") } }
    ),
    SpawnPoint: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "SpawnPoint", metadata: { contractId: keccak256("ember.component.spawnPoint") } }
    ),
    Inventory: defineComponent(
      world,
      { value: Type.Number },
      { id: "Inventory", metadata: { contractId: keccak256("ember.component.inventoryComponent") } }
    ),
    ResourceGenerator: defineComponent(
      world,
      { value: Type.String },
      { id: "ResourceGenerator", metadata: { contractId: keccak256("ember.component.resourceGenerator") } }
    ),
    EscapePortal: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "EscapePortal", metadata: { contractId: keccak256("ember.component.escapePortal") } }
    ),
    Winner: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Winner", metadata: { contractId: keccak256("ember.component.winner") } }
    ),
    Death: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Death", metadata: { contractId: keccak256("ember.component.Death") } }
    ),
    Hero: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Hero", metadata: { contractId: keccak256("ember.component.Hero") } }
    ),
  };

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("world.component.components")]: "Components",
    [keccak256("world.component.systems")]: "Systems",
    [keccak256("ember.component.unitType")]: "UnitType",
    [keccak256("ember.component.structureType")]: "StructureType",
    [keccak256("ember.component.itemType")]: "ItemType",
    [keccak256("ember.component.gameConfigComponent")]: "GameConfig",
    [keccak256("ember.component.positionComponent")]: "Position",
    [keccak256("ember.component.terrainType")]: "TerrainType",
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
    [keccak256("ember.component.factoryComponent")]: "Factory",
    [keccak256("ember.component.capturable")]: "Capturable",
    [keccak256("ember.component.spawnPoint")]: "SpawnPoint",
    [keccak256("ember.component.inventoryComponent")]: "Inventory",
    [keccak256("ember.component.resourceGenerator")]: "ResourceGenerator",
    [keccak256("ember.component.escapePortal")]: "EscapePortal",
    [keccak256("ember.component.winner")]: "Winner",
    [keccak256("ember.component.Death")]: "Death",
    [keccak256("ember.component.Hero")]: "Hero",
  };

  const contractConfig: SetupContractConfig = {
    clock: {
      period: 1000,
      initialTime: 0,
      syncInterval: 5000,
    },
    provider: {
      jsonRpcUrl: config.jsonRpc,
      wsRpcUrl: config.wsRpc,
      options: {
        batch: false,
      },
    },
    privateKey: config.privateKey,
    chainId: config.chainId,
    checkpointServiceUrl: config.checkpointUrl,
    initialBlockNumber: config.initialBlockNumber,
  };

  const DEV_MODE = contractConfig.chainId === LOCAL_CHAIN_ID || config?.devMode;

  // Instantiate contracts and set up mappings
  const { txQueue, systems, txReduced$, encoders, network, startSync } = await setupContracts(
    config.worldAddress,
    contractConfig,
    world,
    components.Systems,
    components.Components,
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

    const data = (await encoders)[component.metadata.contractId](newValue);
    const entityId = world.entities[entity];

    console.log(`Sent transaction to edit networked Component ${component.id} for Entity ${entityId}`);
    await systems["ember.system.componentDev"].executeTyped(
      component.metadata.contractId,
      BigNumber.from(entityId),
      data
    );
  }

  async function joinGame(spawnEntity: EntityID) {
    console.log(`Joining game at position ${spawnEntity}`);
    return systems["ember.system.playerJoin"].executeTyped(BigNumber.from(spawnEntity));
  }

  async function moveEntity(entity: string, path: WorldCoord[]) {
    console.log(`Moving entity ${entity} to position (${path[path.length - 1].x}, ${path[path.length - 1].y})}`);
    // TODO: debug why moving tx fails when stamina is going from 1 to 0 and we estimate gas
    return systems["ember.system.move"].executeTyped(BigNumber.from(entity), path, { gasLimit: 1_000_000 });
  }

  async function attackEntity(attacker: EntityID, defender: EntityID) {
    console.log(`Entity ${attacker} attacking ${defender}.`);
    return systems["ember.system.combat"].executeTyped(BigNumber.from(attacker), BigNumber.from(defender));
  }

  async function buildAt(builderId: EntityID, prototypeId: string, position: WorldCoord) {
    console.log(`Building entity ${prototypeId} from factory ${builderId} at coord ${JSON.stringify(position)}`);
    return systems["ember.system.factory"].executeTyped(
      BigNumber.from(builderId),
      BigNumber.from(prototypeId),
      position
    );
  }

  async function transferInventory(inventoryOwnerEntity: EntityID, receiverEntity: EntityID) {
    console.log(`transfering inventory from  ${inventoryOwnerEntity} to ${receiverEntity}.`);
    return systems["ember.system.TransferInventory"].executeTyped(
      BigNumber.from(inventoryOwnerEntity),
      BigNumber.from(receiverEntity)
    );
  }

  async function dropInventory(ownedEntity: EntityID, targetPosition: WorldCoord) {
    console.log(`Drop Inventory at position ${JSON.stringify(targetPosition)}`);
    return systems["ember.system.dropInventory"].executeTyped(BigNumber.from(ownedEntity), targetPosition);
  }

  async function gatherResource(generator: EntityID, gatherer: EntityID) {
    console.log(`Gathering resource`);
    return systems["ember.system.gatherResource"].executeTyped(BigNumber.from(generator), BigNumber.from(gatherer));
  }

  async function escapePortal(entity: EntityID, escapePortalEntity: EntityID) {
    console.log(`Entity ${entity} taking escapePortal ${escapePortalEntity}`);
    return systems["ember.system.escapePortal"].executeTyped(
      BigNumber.from(entity),
      BigNumber.from(escapePortalEntity)
    );
  }

  // debug functions
  async function spawnGold(targetPosition: WorldCoord) {
    console.log(`Spawn gold at position ${JSON.stringify(targetPosition)}`);
    return systems["ember.system.spawnGoldDev"].executeTyped(targetPosition);
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
      buildAt,
      transferInventory,
      dropInventory,
      gatherResource,
      escapePortal,
      dev: {
        spawnGold,
      },
    },
    DEV_MODE,
  };
}
