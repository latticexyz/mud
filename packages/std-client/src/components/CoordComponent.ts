import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineCoordComponent(world: World, options?: { id?: string; metadata?: Metadata }) {
  return defineComponent(world, { x: Type.Number, y: Type.Number }, options);
}
