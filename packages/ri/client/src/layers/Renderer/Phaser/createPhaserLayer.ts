import {
  createWorld,
  createEntity,
  withValue,
  getQueryResult,
  Has,
  HasValue,
  getComponentValueStrict,
  defineReactionSystem,
} from "@mudkit/recs";
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
} from "./systems";
import { createPhaserEngine } from "@mudkit/phaserx";
import {
  defineAppearanceComponent,
  defineSpriteAnimationComponent,
  defineOutlineComponent,
  defineHueTintComponent,
} from "./components";
import { config } from "./config";
import { createSelectionOutlineSystem } from "./systems/SelectionOutlineSystem";
import { coordsOf } from "@mudkit/utils";

/**
 * The Phaser layer extends the Local layer.
 * Its purpose is to render the state of parent layers to a Phaser world.
 */
export async function createPhaserLayer(local: LocalLayer) {
  // World
  const world = createWorld({ parentWorld: local.world });

  // Components
  const Appearance = defineAppearanceComponent(world);
  const SpriteAnimation = defineSpriteAnimationComponent(world);
  const Outline = defineOutlineComponent(world);
  const HueTint = defineHueTintComponent(world);
  const components = { Appearance, SpriteAnimation, Outline, HueTint };

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

  // TODO: Remove, only for testing

  defineReactionSystem(
    world,
    () => getComponentValueStrict(local.components.Selection, local.singletonEntity),
    (selection) => {
      for (const coord of coordsOf(selection)) {
        const { MinedTag, Position } = layer.parentLayers.network.components;
        if (getQueryResult([HasValue(Position, coord), Has(MinedTag)]).size === 0) {
          createEntity(layer.parentLayers.network.world, [withValue(MinedTag, {}), withValue(Position, coord)]);
        }
      }
    }
  );

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

  return layer;
}
