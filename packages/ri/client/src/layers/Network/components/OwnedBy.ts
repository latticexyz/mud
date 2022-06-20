import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineOwnedByComponent(world: World, contractId: string) {
  return defineComponent(world, { value: Type.Entity }, { name: "OwnedBy", metadata: { contractId } });
}
