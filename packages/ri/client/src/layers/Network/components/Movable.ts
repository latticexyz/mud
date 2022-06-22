import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineMovableComponent(world: World, contractId: string) {
  return defineComponent(world, { value: Type.Boolean }, { id: "Movable", metadata: { contractId } });
}
