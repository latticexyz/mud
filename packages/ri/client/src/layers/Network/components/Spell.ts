import { defineComponent, Type, World } from "@mud/recs";

export function defineSpellComponent(world: World) {
  return defineComponent(world, { embodiedSystemSelector: Type.String, spellTargetFilter: Type.Number });
}
