import { defineComponent, World } from "@latticexyz/recs";

export function defineMinedTagComponent(world: World, contractId: string) {
  return defineComponent(world, {}, { name: "Mined", metadata: { contractId } });
}
