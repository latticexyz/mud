import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineEntityTypeComponent(world: World, contractId: string) {
  return defineComponent(world, { value: Type.Number }, { name: "EntityType", metadata: { contractId } });
}
