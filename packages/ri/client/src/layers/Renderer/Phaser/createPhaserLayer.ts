import { createWorld } from "@latticexyz/recs";
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
} from "./systems";
import { createPhaserEngine } from "@latticexyz/phaserx";
import {
  defineAppearanceComponent,
  defineSpriteAnimationComponent,
  defineOutlineComponent,
  defineHueTintComponent,
} from "./components";
import { config } from "./config";
import { createSelectionOutlineSystem } from "./systems/SelectionOutlineSystem";
import { defineDevHighlightComponent } from "@latticexyz/std-client";

/**
 * The Phaser layer extends the Local layer.
 * Its purpose is to render the state of parent layers to a Phaser world.
 */
export async function createPhaserLayer(local: LocalLayer) {
  // World
  const world = local.world;

  // Components
  const Appearance = defineAppearanceComponent(world);
  const SpriteAnimation = defineSpriteAnimationComponent(world);
  const Outline = defineOutlineComponent(world);
  const HueTint = defineHueTintComponent(world);
  const DevHighlight = defineDevHighlightComponent(world);
  const components = { Appearance, SpriteAnimation, Outline, HueTint, DevHighlight };

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
  };

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
  createSelectionOutlineSystem(layer);
  createDrawDevHighlightSystem(layer);
  createInputSystem(layer);

  return layer;
}
