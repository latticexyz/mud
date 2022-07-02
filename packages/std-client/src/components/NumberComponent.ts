import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineNumberComponent(world: World, options?: { id?: string; metadata?: Metadata }) {
  return defineComponent(world, { value: Type.Number }, options);
}
