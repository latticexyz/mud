import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { getComponentValue, Has, defineSystem, UpdateType } from "@latticexyz/recs";
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

  defineSystem(world, [Has(DevHighlight), Has(LocalPosition)], (update) => {
    if (update.type === UpdateType.Exit) {
      return objectPool.remove(`${update.entity}-dev-highlight`);
    }

    const devHighlight = getComponentValue(DevHighlight, update.entity);
    if (!devHighlight) return;

    const position = getComponentValue(LocalPosition, update.entity);
    if (!position) return;

    const highlight = objectPool.get(`${update.entity}-dev-highlight`, "Rectangle");
    highlight.setComponent({
      id: "highlight",
      once: (box) => {
        const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
        box.setVisible(true);
        box.setFillStyle(devHighlight.color ?? 0xf0e71d, 0.5);
        box.setSize(tileWidth, tileHeight);
        box.setPosition(pixelCoord.x + tileWidth / 2, pixelCoord.y + tileHeight / 2);
      },
    });
  });
}
