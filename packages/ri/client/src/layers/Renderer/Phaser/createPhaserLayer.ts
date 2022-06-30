import { LocalLayer } from "../../Local";
import {
  createMapSystem,
  createLocalPositionSystem,
  createSyncSystem,
  createAppearanceSystem,
  createSpriteAnimationSystem,
  createOutlineSystem,
  createHueTintSystem,
  createSelectionSystem,
  createDrawDevHighlightSystem,
  createInputSystem,
  createDrawStaminaSystem,
  createDrawHighlightCoordSystem,
  createDrawPotentialPathSystem,
  createPlayerSpawnSystem,
} from "./systems";
import { createPhaserEngine } from "@latticexyz/phaserx";
import {
  defineAppearanceComponent,
  defineSpriteAnimationComponent,
  defineOutlineComponent,
  defineHueTintComponent,
} from "./components";
import { config } from "./config";
import { defineDevHighlightComponent } from "@latticexyz/std-client";
import { defineComponent, namespaceWorld, Type } from "@latticexyz/recs";
import { highlightCoord } from "./api";
import { curry } from "lodash";
import { Coord } from "@latticexyz/utils";

/**
 * The Phaser layer extends the Local layer.
 * Its purpose is to render the state of parent layers to a Phaser world.
 */
export async function createPhaserLayer(local: LocalLayer) {
  // World
  const world = namespaceWorld(local.parentLayers.network.world, "phaser");

  // Components
  const Appearance = defineAppearanceComponent(world);
  const SpriteAnimation = defineSpriteAnimationComponent(world);
  const Outline = defineOutlineComponent(world);
  const HueTint = defineHueTintComponent(world);
  const DevHighlight = defineDevHighlightComponent(world);
  const HoverHighlight = defineComponent(
    world,
    { color: Type.OptionalNumber, x: Type.OptionalNumber, y: Type.OptionalNumber },
    { id: "HoverHighlight" }
  );
  const components = { Appearance, SpriteAnimation, Outline, HueTint, DevHighlight, HoverHighlight };

  // Create phaser engine
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(config);
  world.registerDisposer(disposePhaser);

  // Layer
  const layer = {
    world,
    components,
    parentLayers: {
      ...local.parentLayers,
      local,
    },
    game,
    scenes,
    api: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      highlightCoord: (coord: Coord) => {
        "no-op for types";
      },
    },
  };
  layer.api.highlightCoord = curry(highlightCoord)(layer);

  // Debugger
  // createDebugger(
  //   scenes.Main.camera,
  //   scenes.Main.chunks,
  //   scenes.Main.phaserScene,
  //   scenes.Main.objectPool,
  //   scenes.Main.maps.Main
  // );

  // Systems
  createSyncSystem(layer);
  createMapSystem(layer);
  createLocalPositionSystem(layer);
  createAppearanceSystem(layer);
  createSpriteAnimationSystem(layer);
  createOutlineSystem(layer);
  createHueTintSystem(layer);
  createSelectionSystem(layer);
  createDrawDevHighlightSystem(layer);
  createInputSystem(layer);
  createDrawStaminaSystem(layer);
  createDrawHighlightCoordSystem(layer);
  createDrawPotentialPathSystem(layer);
  createPlayerSpawnSystem(layer);

  return layer;
}
