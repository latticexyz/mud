import { Has, getComponentValue, defineSystem, UpdateType, isComponentUpdate } from "@latticexyz/recs";
import { tween, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { PhaserLayer } from "../../types";
import { Coord } from "@latticexyz/utils";

/**
 * The LocalPosition system handles moving phaser game objects to the WorldCoord specified in their LocalPosition component.
 */
export function createLocalPositionSystem(layer: PhaserLayer) {
  const {
    world,
    components: { Appearance },
    parentLayers: {
      local: {
        components: { LocalPosition, MoveSpeed },
        constants: { DEFAULT_MOVE_SPEED },
      },
    },
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = layer;

  // Set position the first time entitiy's Position component appears
  defineSystem(world, [Has(LocalPosition), Has(Appearance)], (update) => {
    const embodiedEntity = objectPool.get(update.entity, "Sprite");
    let pos: Coord | undefined;
    if (isComponentUpdate(update, LocalPosition)) {
      [pos] = update.value;
    } else {
      pos = getComponentValue(LocalPosition, update.entity);
    }

    if (update.type === UpdateType.Exit) {
      embodiedEntity.removeComponent(LocalPosition.id);
      embodiedEntity.despawn();
      return;
    }

    if (!pos) return;
    if (update.type === UpdateType.Enter) {
      const pixel = tileCoordToPixelCoord(pos, tileWidth, tileHeight);
      embodiedEntity.setComponent({
        id: LocalPosition.id,
        once: (gameObject) => {
          gameObject.setPosition(pixel.x, pixel.y);
        },
      });
    }

    if (update.type === UpdateType.Update) {
      const pixel = tileCoordToPixelCoord(pos, tileWidth, tileHeight);
      embodiedEntity.setComponent({
        id: LocalPosition.id,
        now: async (gameObject) => {
          const moveSpeed = getComponentValue(MoveSpeed, update.entity)?.current || DEFAULT_MOVE_SPEED;
          await tween({
            targets: gameObject,
            duration: moveSpeed,
            props: {
              x: pixel.x,
              y: pixel.y,
            },
            ease: Phaser.Math.Easing.Quadratic.InOut,
          });
        },
        once: (gameObject) => {
          gameObject.setPosition(pixel.x, pixel.y);
        },
      });
    }
  });
}
