import { defineComponent, Type, World } from "@latticexyz/recs";

/**
 * DevHighlight is for use during development to highlight the positions of
 * entities that you are interacting with.
 * Example: Highlight the Entities that you are currently editing in the ComponentBrowser.
 */
export function defineDevHighlightComponent(world: World) {
  return defineComponent(world, { value: Type.OptionalNumber }, { id: "DevHighlight" });
}
