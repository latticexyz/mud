import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineLocalEntityTypeComponent(world: World) {
  return defineComponent(world, { value: Type.Number }, { id: "LocalEntityType" });
}
