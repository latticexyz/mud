import { defineComponent, Type, World } from "@latticexyz/recs";

export function createBrowserDevComponents(world: World) {
  const devHighlightComponent = defineComponent(world, {
    value: Type.OptionalNumber,
  });

  const hoverHighlightComponent = defineComponent(world, {
    x: Type.OptionalNumber,
    y: Type.OptionalNumber,
  });

  return {
    devHighlightComponent,
    hoverHighlightComponent,
  };
}
