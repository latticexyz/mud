import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineReactionSystem, defineUpdateQuery, defineExitQuery, getComponentValue, Has } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawDevHighlightSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      local: {
        components: { LocalPosition },
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
    components: { DevHighlight },
  } = layer;

  const exitQuery = defineExitQuery(world, [Has(DevHighlight)]);
  defineReactionSystem(
    world,
    () => exitQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const highlight = objectPool.get(`${entity}-dev-highlight`, "Rectangle");
        highlight.setComponent({
          id: entity,
          once: (box) => {
            box.setVisible(false);
          },
        });
      }
    }
  );

  const query = defineUpdateQuery(world, [Has(DevHighlight), Has(LocalPosition)], { runOnInit: true });
  return defineReactionSystem(
    world,
    () => query.get(),
    (entities) => {
      for (const entity of entities) {
        const devHighlight = getComponentValue(DevHighlight, entity);
        if (!devHighlight) continue;

        const position = getComponentValue(LocalPosition, entity);
        if (!position) continue;

        const highlight = objectPool.get(`${entity}-dev-highlight`, "Rectangle");
        highlight.setComponent({
          id: entity,
          once: (box) => {
            const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

            box.setVisible(true);
            box.setFillStyle(devHighlight.color ?? 0xf0e71d, 0.5);
            box.setSize(tileWidth, tileHeight);
            box.setPosition(pixelCoord.x + tileWidth / 2, pixelCoord.y + tileHeight / 2);
          },
        });
      }
    }
  );
}
