import { TxQueue } from "@latticexyz/network";
import { Component, ComponentValue, defineComponent, EntityIndex, Schema, Type, World } from "@latticexyz/recs";
import { BigNumber } from "ethers";
import { SystemTypes } from "ri-contracts/types/SystemTypes";

export function setupDevSystems(
  world: World,
  encoders: Promise<Record<string, (value: { [key: string]: unknown }) => string>>,
  systems: TxQueue<SystemTypes>
) {
  const DevHighlightComponent = defineComponent(world, { value: Type.OptionalNumber });

  const HoverHighlightComponent = defineComponent(world, {
    x: Type.OptionalNumber,
    y: Type.OptionalNumber,
  });

  async function setContractComponentValue<T extends Schema>(
    entity: EntityIndex,
    component: Component<T, { contractId: string }>,
    newValue: ComponentValue<T>
  ) {
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

  return { setContractComponentValue, DevHighlightComponent, HoverHighlightComponent };
}
