import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineSpellComponent(world: World, contractId: string) {
  return defineComponent(
    world,
    { embodiedSystemSelector: Type.String, spellTargetFilter: Type.Number },
    { name: "Spell", metadata: { contractId } }
  );
}
