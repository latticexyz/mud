import { createWorld, Entity, createEntity, withValue } from "@mud/recs";
import { WorldCoord } from "../../types";
import {
  definePositionComponent,
  defineEntityTypeComponent,
  defineUntraversableComponent,
  defineMinedTagComponent,
} from "./components";
import { setupContracts } from "./setup";
import { LAYER_NAME } from "./constants";
import { decodeEntityType, decodePosition, decodeUntraversable } from "./decoders";
import { EntityTypes } from "./types";
import { networkToContractEntity } from "./utils";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(options?: { skipContracts?: boolean }) {
  // World
  const world = createWorld({ name: LAYER_NAME });

  // Components
  const components = {
    Position: definePositionComponent(world),
    EntityType: defineEntityTypeComponent(world),
    Untraversable: defineUntraversableComponent(world),
    MinedTag: defineMinedTagComponent(world),
  };

  // Contracts and mappings
  const { txQueue, txReduced$ } = setupContracts(
    world,
    components,
    {
      Position: { decoder: decodePosition, id: "ember.component.positionComponent" },
      EntityType: { decoder: decodeEntityType, id: "ember.component.entityTypeComponent" },
      Untraversable: { decoder: decodeUntraversable, id: "ember.component.untraversableComponent" },
      MinedTag: { decoder: () => ({}), id: "ember.component.minedTagComponent" },
    },
    { skip: options?.skipContracts }
  );

  // API
  function setPosition(entity: Entity, position: WorldCoord) {
    const contractEntity = networkToContractEntity(entity);
    txQueue.Ember.addComponentToEntityExternally(
      contractEntity,
      "ember.component.positionComponent",
      abi.encode(["uint256", "uint256"], [position.x, position.y])
    );
    console.log("Setting position", entity, position);
  }

  function setEntityType(entity: Entity, entityType: EntityTypes) {
    const contractEntity = networkToContractEntity(entity);
    txQueue.Ember.addComponentToEntityExternally(
      contractEntity,
      "ember.component.entityTypeComponent",
      abi.encode(["uint256"], [entityType])
    );
    console.log("Setting entityType", entity, entityType);
  }

  // Constants (load from contract later)
  const constants = {
    mapSize: 50,
  };

  // TODO: get this from the contract
  // Create tag
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      createEntity(world, [withValue(components.MinedTag, {}), withValue(components.Position, { x, y })]);
    }
  }

  return {
    world,
    components,
    constants,
    txQueue,
    txReduced$,
    api: {
      setPosition,
      setEntityType,
    },
  };
}
