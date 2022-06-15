import { Component, ComponentValue, createWorld, Entity, Schema, Type } from "@latticexyz/recs";
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
import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { keccak256 } from "@latticexyz/utils";
import { Mappings } from "@latticexyz/network";

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

  // Define mappings between contract and client components
  const mappings: Mappings<typeof components> = {
    [keccak256("ember.component.positionComponent")]: "Position",
    [keccak256("ember.component.entityTypeComponent")]: "EntityType",
    [keccak256("ember.component.untraversableComponent")]: "Untraversable",
    [keccak256("ember.component.minedTagComponent")]: "MinedTag",
    [keccak256("ember.component.spellComponent")]: "Spell",
    [keccak256("ember.component.embodiedSystemArgumentComponent")]: "EmbodiedSystemArgumentComponent",
  };

  // Instantiate contracts and set up mappings
  const { txQueue, txReduced$ } = await setupContracts(world, components, mappings);

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

    const componentContract = await txQueue.World.getComponent(keccak256(component.metadata.contractId));
    const contractArgTypes = [] as string[];
    const contractArgs = Object.values(newValue);

    for (const type of Object.values(component.schema)) {
      if (type === Type.Number) {
        contractArgTypes.push("uint256");
      } else {
        contractArgTypes.push("string");
      }
    }

    console.log(`Sent transaction to edit networked Component ${component.id} for Entity ${entity}`);
    txQueue.Game.addComponentToEntityExternally(
      BigNumber.from(entity),
      componentContract,
      abi.encode(contractArgTypes, contractArgs)
    );
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
    },
  };
}
