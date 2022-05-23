import { defineEnterQuery, defineReactionSystem, defineUpdateQuery, Has, getComponentValue } from "@mudkit/recs";
import { tween, tileCoordToPixelCoord } from "@mudkit/phaserx";
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
  const newEntities = defineEnterQuery(world, [Has(LocalPosition), Has(Appearance)], { runOnInit: true });

  defineReactionSystem(
    world,
    () => newEntities.get(),
    (entities) => {
      for (const entity of entities) {
        const pos = getComponentValue(LocalPosition, entity);
        if (!pos) continue;

        const pixel = tileCoordToPixelCoord(pos, tileWidth, tileHeight);
        const embodiedEntity = objectPool.get(entity, "Sprite");

        embodiedEntity.setComponent({
          id: LocalPosition.id,
          once: (gameObject) => {
            gameObject.setPosition(pixel.x, pixel.y);
          },
        });
      }
    }
  );

  // Update position if entity's Position component updated
  const updatedEntities = defineUpdateQuery(world, [Has(LocalPosition), Has(Appearance)]);
  defineReactionSystem(
    world,
    () => updatedEntities.get(),
    (entities) => {
      for (const entity of entities) {
        const newPosition = getComponentValue(LocalPosition, entity);
        if (!newPosition) continue;

        const pixel = tileCoordToPixelCoord(newPosition, tileWidth, tileHeight);
        const embodiedEntity = objectPool.get(entity, "Sprite");

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
    }
  );
}
