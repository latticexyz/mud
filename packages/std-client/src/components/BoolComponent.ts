import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineBoolComponent(world: World, options?: { id?: string; metadata?: Metadata }) {
  return defineComponent(world, { value: Type.Boolean }, options);
}
