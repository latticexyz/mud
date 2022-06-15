import { createWorld, Entity } from "@latticexyz/recs";
import { WorldCoord } from "../../types";
import {
  definePositionComponent,
  defineEntityTypeComponent,
  defineUntraversableComponent,
  defineMinedTagComponent,
  defineSpellComponent,
  defineEmbodiedSystemArgumentComponent,
} from "./components";
import { setupContracts } from "./setup";
import { LAYER_NAME } from "./constants.local";
import { decodeEntityType, decodePosition, decodeSpell, decodeUntraversable } from "./decoders";
import { EntityTypes } from "./types";
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { keccak256 } from "@latticexyz/utils";

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer() {
  // World
  const world = createWorld({ name: LAYER_NAME });

  // Components
  const components = {
    Position: definePositionComponent(world),
    EntityType: defineEntityTypeComponent(world),
    Untraversable: defineUntraversableComponent(world),
    MinedTag: defineMinedTagComponent(world),
    Spell: defineSpellComponent(world),
    EmbodiedSystemArgumentComponent: defineEmbodiedSystemArgumentComponent(world),
  };

  // Contracts and mappings
  const { txQueue, txReduced$ } = await setupContracts(world, components, {
    Position: { decoder: decodePosition, id: "ember.component.positionComponent" },
    EntityType: { decoder: decodeEntityType, id: "ember.component.entityTypeComponent" },
    Untraversable: { decoder: decodeUntraversable, id: "ember.component.untraversableComponent" },
    MinedTag: { decoder: () => ({}), id: "ember.component.minedTagComponent" },
    Spell: { decoder: decodeSpell, id: "ember.component.spellComponent" },
    EmbodiedSystemArgumentComponent: {
      decoder: (value: string) => ({ value }),
      id: "ember.component.embodiedSystemArgumentComponent",
    },
  });

  // API
  const positionContract = await txQueue.World.getComponent(keccak256("ember.component.positionComponent"));
  async function setPosition(entity: Entity, position: WorldCoord) {
    console.log("Position contract at ", positionContract);
    txQueue.Game.addComponentToEntityExternally(
      BigNumber.from(entity),
      positionContract,
      abi.encode(["uint256", "uint256"], [position.x, position.y])
    );

    console.log("Setting position", entity, position);
  }

  const entityTypeContract = await txQueue.World.getComponent(keccak256("ember.component.entityTypeComponent"));
  async function setEntityType(entity: Entity, entityType: EntityTypes) {
    console.log("Entity type contract", entityTypeContract);
    txQueue.Game.addComponentToEntityExternally(
      BigNumber.from(entity),
      entityTypeContract,
      abi.encode(["uint256"], [entityType])
    );
    console.log("Setting entityType", entity, entityType);
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
    api: {
      setPosition,
      setEntityType,
    },
  };
}
