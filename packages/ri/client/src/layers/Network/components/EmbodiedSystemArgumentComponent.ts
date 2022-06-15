import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineEmbodiedSystemArgumentComponent(world: World, contractId: string) {
  return defineComponent(world, { value: Type.String }, { name: "EmbodiedSystemArgument", metadata: { contractId } });
}
