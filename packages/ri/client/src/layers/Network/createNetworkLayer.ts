import {
  Component,
  ComponentValue,
  createWorld,
  defineComponent,
  EntityID,
  EntityIndex,
  getComponentValue,
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
      { id: "GameConfig", metadata: { contractId: keccak256("mudwar.component.GameConfig") } }
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
      { id: "UnitType", metadata: { contractId: keccak256("mudwar.component.UnitType") } }
    ),
    StructureType: defineComponent(
      world,
      { value: Type.Number },
      { id: "StructureType", metadata: { contractId: keccak256("mudwar.component.StructureType") } }
    ),
    ItemType: defineComponent(
      world,
      { value: Type.Number },
      { id: "ItemType", metadata: { contractId: keccak256("mudwar.component.ItemType") } }
    ),
    TerrainType: defineComponent(
      world,
      { value: Type.Number },
      { id: "TerrainType", metadata: { contractId: keccak256("mudwar.component.TerrainType") } }
    ),
    Position: definePositionComponent(world, keccak256("mudwar.component.Position")),
    Movable: defineMovableComponent(world, keccak256("mudwar.component.Movable")),
    OwnedBy: defineOwnedByComponent(world, keccak256("mudwar.component.OwnedBy")),
    Untraversable: defineUntraversableComponent(world, keccak256("mudwar.component.Untraversable")),
    Player: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Player", metadata: { contractId: keccak256("mudwar.component.Player") } }
    ),
    Stamina: defineComponent(
      world,
      { current: Type.Number, max: Type.Number, regeneration: Type.Number },
      { id: "Stamina", metadata: { contractId: keccak256("mudwar.component.Stamina") } }
    ),
    LastActionTurn: defineComponent(
      world,
      { value: Type.Number },
      { id: "LastActionTurn", metadata: { contractId: keccak256("mudwar.component.LastActionTurn") } }
    ),
    Health: defineComponent(
      world,
      { current: Type.Number, max: Type.Number },
      { id: "Health", metadata: { contractId: keccak256("mudwar.component.Health") } }
    ),
    Attack: defineComponent(
      world,
      { strength: Type.Number, range: Type.Number },
      { id: "Attack", metadata: { contractId: keccak256("mudwar.component.Attack") } }
    ),
    PrototypeCopy: defineComponent(
      world,
      { value: Type.Entity },
      { id: "PrototypeCopy", metadata: { contractId: keccak256("mudwar.component.PrototypeCopy") } }
    ),
    Prototype: defineComponent(
      world,
      { value: Type.StringArray },
      { id: "Prototype", metadata: { contractId: keccak256("mudwar.component.Prototype") } }
    ),
    Factory: defineComponent(
      world,
      { prototypeIds: Type.StringArray, costs: Type.NumberArray, costItemTypes: Type.NumberArray },
      { id: "Factory", metadata: { contractId: keccak256("mudwar.component.Factory") } }
    ),
    Capturable: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Capturable", metadata: { contractId: keccak256("mudwar.component.Capturable") } }
    ),
    SpawnPoint: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "SpawnPoint", metadata: { contractId: keccak256("mudwar.component.SpawnPoint") } }
    ),
    Inventory: defineComponent(
      world,
      { value: Type.Number },
      { id: "Inventory", metadata: { contractId: keccak256("mudwar.component.Inventory") } }
    ),
    ResourceGenerator: defineComponent(
      world,
      { value: Type.String },
      { id: "ResourceGenerator", metadata: { contractId: keccak256("mudwar.component.ResourceGenerator") } }
    ),
    EscapePortal: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "EscapePortal", metadata: { contractId: keccak256("mudwar.component.EscapePortal") } }
    ),
    Winner: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Winner", metadata: { contractId: keccak256("mudwar.component.Winner") } }
    ),
    Death: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Death", metadata: { contractId: keccak256("mudwar.component.Death") } }
    ),
    Hero: defineComponent(
      world,
      { value: Type.Boolean },
      { id: "Hero", metadata: { contractId: keccak256("mudwar.component.Hero") } }
    ),
  };

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("world.component.components")]: "Components",
    [keccak256("world.component.systems")]: "Systems",
    [keccak256("mudwar.component.UnitType")]: "UnitType",
    [keccak256("mudwar.component.StructureType")]: "StructureType",
    [keccak256("mudwar.component.ItemType")]: "ItemType",
    [keccak256("mudwar.component.GameConfig")]: "GameConfig",
    [keccak256("mudwar.component.Position")]: "Position",
    [keccak256("mudwar.component.TerrainType")]: "TerrainType",
    [keccak256("mudwar.component.Movable")]: "Movable",
    [keccak256("mudwar.component.OwnedBy")]: "OwnedBy",
    [keccak256("mudwar.component.Untraversable")]: "Untraversable",
    [keccak256("mudwar.component.LastActionTurn")]: "LastActionTurn",
    [keccak256("mudwar.component.Stamina")]: "Stamina",
    [keccak256("mudwar.component.Player")]: "Player",
    [keccak256("mudwar.component.Health")]: "Health",
    [keccak256("mudwar.component.Attack")]: "Attack",
    [keccak256("mudwar.component.Prototype")]: "Prototype",
    [keccak256("mudwar.component.PrototypeCopy")]: "PrototypeCopy",
    [keccak256("mudwar.component.Factory")]: "Factory",
    [keccak256("mudwar.component.Capturable")]: "Capturable",
    [keccak256("mudwar.component.SpawnPoint")]: "SpawnPoint",
    [keccak256("mudwar.component.Inventory")]: "Inventory",
    [keccak256("mudwar.component.ResourceGenerator")]: "ResourceGenerator",
    [keccak256("mudwar.component.EscapePortal")]: "EscapePortal",
    [keccak256("mudwar.component.Winner")]: "Winner",
    [keccak256("mudwar.component.Death")]: "Death",
    [keccak256("mudwar.component.Hero")]: "Hero",
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
    await systems["mudwar.component.ComponentDev"].executeTyped(
      component.metadata.contractId,
      BigNumber.from(entityId),
      data
    );
  }

  async function joinGame(spawnEntity: EntityID) {
    console.log(`Joining game at position ${spawnEntity}`);
    return systems["mudwar.system.PlayerJoin"].executeTyped(BigNumber.from(spawnEntity));
  }

  async function moveEntity(entity: string, path: WorldCoord[]) {
    console.log(`Moving entity ${entity} to position (${path[path.length - 1].x}, ${path[path.length - 1].y})}`);
    return systems["mudwar.system.Move"].executeTyped(BigNumber.from(entity), path, { gasLimit: 1_000_000 });
  }

  async function attackEntity(attacker: EntityID, defender: EntityID) {
    console.log(`Entity ${attacker} attacking ${defender}.`);
    return systems["mudwar.system.Combat"].executeTyped(BigNumber.from(attacker), BigNumber.from(defender));
  }

  async function buildAt(builderId: EntityID, prototypeId: string, position: WorldCoord) {
    console.log(`Building entity ${prototypeId} from factory ${builderId} at coord ${JSON.stringify(position)}`);
    return systems["mudwar.system.Factory"].executeTyped(
      BigNumber.from(builderId),
      BigNumber.from(prototypeId),
      position
    );
  }

  async function transferInventory(inventoryOwnerEntity: EntityID, receiverEntity: EntityID) {
    console.log(`transfering inventory from  ${inventoryOwnerEntity} to ${receiverEntity}.`);
    return systems["mudwar.system.TransferInventory"].executeTyped(
      BigNumber.from(inventoryOwnerEntity),
      BigNumber.from(receiverEntity)
    );
  }

  async function dropInventory(ownedEntity: EntityID, targetPosition: WorldCoord) {
    console.log(`Drop Inventory at position ${JSON.stringify(targetPosition)}`);
    return systems["mudwar.system.DropInventory"].executeTyped(BigNumber.from(ownedEntity), targetPosition);
  }

  async function gatherResource(generator: EntityID, gatherer: EntityID) {
    console.log(`Gathering resource`);
    return systems["mudwar.system.GatherResource"].executeTyped(BigNumber.from(generator), BigNumber.from(gatherer));
  }

  async function escapePortal(entity: EntityID, escapePortalEntity: EntityID) {
    console.log(`Entity ${entity} taking escapePortal ${escapePortalEntity}`);
    return systems["mudwar.system.EscapePortal"].executeTyped(
      BigNumber.from(entity),
      BigNumber.from(escapePortalEntity)
    );
  }

  // debug functions
  async function spawnGold(targetPosition: WorldCoord) {
    console.log(`Spawn gold at position ${JSON.stringify(targetPosition)}`);
    return systems["mudwar.system.SpawnGoldDev"].executeTyped(targetPosition);
  }

  // Constants (load from contract later)
  const constants = {
    mapSize: 50,
  };

  const checkOwnEntity = (entity: EntityIndex) => {
    const entityOwner = getComponentValue(components.OwnedBy, entity)?.value;
    return entityOwner && entityOwner === network.connectedAddress.get();
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
    utils: {
      checkOwnEntity,
    },
    DEV_MODE,
  };
}
