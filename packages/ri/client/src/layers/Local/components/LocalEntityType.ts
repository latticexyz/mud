import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineLocalEntityTypeComponent(world: World) {
  return defineComponent(world, { entityType: Type.Number }, { id: "LocalEntityType" });
}
