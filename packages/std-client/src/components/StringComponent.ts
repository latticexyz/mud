import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineStringComponent<M extends Metadata>(world: World, options?: { id?: string; metadata?: M }) {
  return defineComponent<{ value: Type.String }, M>(world, { value: Type.String }, options);
}
