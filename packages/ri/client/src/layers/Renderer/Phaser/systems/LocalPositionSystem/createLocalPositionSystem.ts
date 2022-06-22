import { Has, getComponentValue, defineSystem, UpdateType } from "@latticexyz/recs";
import { tween, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { PhaserLayer } from "../../types";

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
  defineSystem(world, [Has(LocalPosition), Has(Appearance)], ({ entity, type }) => {
    const pos = getComponentValue(LocalPosition, entity);
    if (!pos) return;

    const pixel = tileCoordToPixelCoord(pos, tileWidth, tileHeight);
    const embodiedEntity = objectPool.get(entity, "Sprite");

    if (type === UpdateType.Exit) {
      embodiedEntity.removeComponent(LocalPosition.id);
    }

    if (type === UpdateType.Enter) {
      embodiedEntity.setComponent({
        id: LocalPosition.id,
        once: (gameObject) => {
          gameObject.setPosition(pixel.x, pixel.y);
        },
      });
    }

    if (type === UpdateType.Update) {
      embodiedEntity.setComponent({
        id: LocalPosition.id,
        now: async (gameObject) => {
          const shouldTeleport = false; // manhattan(currentPosition, newPosition) > 1;
          const moveSpeed = getComponentValue(MoveSpeed, entity)?.current || DEFAULT_MOVE_SPEED;

          !shouldTeleport &&
            (await tween({
              targets: gameObject,
              duration: moveSpeed,
              props: {
                x: pixel.x,
                y: pixel.y,
              },
              ease: Phaser.Math.Easing.Quadratic.InOut,
            }));
        },
        once: (gameObject) => {
          gameObject.setPosition(pixel.x, pixel.y);
        },
      });
    }
  });
}
