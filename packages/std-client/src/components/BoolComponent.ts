import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineBoolComponent<M extends Metadata>(world: World, options?: { id?: string; metadata?: M }) {
  return defineComponent<{ value: Type.Boolean }, M>(world, { value: Type.Boolean }, options);
}
