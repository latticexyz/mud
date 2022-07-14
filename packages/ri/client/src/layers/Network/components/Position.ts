import { defineComponent, Type, World } from "@latticexyz/recs";

export function definePositionComponent(world: World, contractId: string) {
  return defineComponent(
    world,
    { x: Type.Number, y: Type.Number },
    { id: "Position", metadata: { contractId }, indexed: true }
  );
}
