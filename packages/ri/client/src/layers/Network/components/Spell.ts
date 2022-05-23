import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineSpellComponent(world: World) {
  return defineComponent(world, { embodiedSystemSelector: Type.String, spellTargetFilter: Type.Number });
}
