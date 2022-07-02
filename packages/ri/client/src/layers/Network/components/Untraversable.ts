import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineUntraversableComponent(world: World, contractId: string) {
  return defineComponent(world, { value: Type.Boolean }, { id: "Untraversable", metadata: { contractId } });
}
