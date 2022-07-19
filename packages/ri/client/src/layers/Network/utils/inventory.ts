import { Component, EntityID, EntityIndex, Has, HasValue, runQuery, Type } from "@latticexyz/recs";

export function getItems(
  ownedByComponent: Component<{ value: Type.Entity }>,
  itemTypeComponent: Component<{ value: Type.Number }>,
  entityIndexToID: EntityID[]
) {
  return (entity: EntityIndex) => [
    ...runQuery([HasValue(ownedByComponent, { value: entityIndexToID[entity] }), Has(itemTypeComponent)]),
  ];
}
