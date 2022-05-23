import { defineComponent, World, Type } from "@mudkit/recs";

export function defineActionComponent(world: World) {
  return defineComponent(world, { state: Type.Number, on: Type.OptionalEntity });
}
