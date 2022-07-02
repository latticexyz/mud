import { Component, ComponentValue, EntityIndex, Schema } from "@latticexyz/recs";
import { AnyComponent } from "@latticexyz/recs";

export type SetContractComponentFunction<T extends Schema> = (
  entity: EntityIndex,
  component: Component<T, { contractId: string }>,
  newValue: ComponentValue<T>
) => void;

export type AnyComponentWithContract = Component<Schema, { contractId: string }>;

export function hasContract(component: AnyComponent): component is AnyComponentWithContract {
  return component.metadata?.contractId !== undefined;
}
