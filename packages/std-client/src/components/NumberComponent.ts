import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineNumberComponent<M extends Metadata>(world: World, options?: { id?: string; metadata?: M }) {
  return defineComponent<{ value: Type.Number }, M>(world, { value: Type.Number }, options);
}
