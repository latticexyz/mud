import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineUntraversableComponent(world: World, contractId: string) {
  return defineComponent(
    world,
    { traversableBy: Type.EntityArray },
    { name: "Untraversable", metadata: { contractId } }
  );
}
