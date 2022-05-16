import { defineComponent, World, Type } from "@mud/recs";

export function defineActionComponent(world: World) {
  return defineComponent(world, { state: Type.Number, on: Type.OptionalEntity });
}
