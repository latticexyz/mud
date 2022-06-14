import { Component, ComponentValue, Entity, Schema } from "@latticexyz/recs";
import { AnyComponent } from "@latticexyz/recs";

export type SetContractComponentFunction<T extends Schema> = (
  entity: Entity,
  component: Component<T, { contractId: string }>,
  newValues: ComponentValue<T>
) => void;

export type AnyComponentWithContract = Component<Schema, { contractId: string }>;

/**
 * TODO change this to look at the network mapping exported from the network layer
 */
export function hasContract(component: AnyComponent): component is AnyComponentWithContract {
  return component.metadata.contractId !== undefined;
}
