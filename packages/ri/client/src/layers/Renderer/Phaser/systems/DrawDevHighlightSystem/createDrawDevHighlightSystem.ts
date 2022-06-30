import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineSystem, UpdateType } from "@latticexyz/recs";
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

  defineSystem(world, [Has(DevHighlight), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      return objectPool.remove(`${entity}-dev-highlight`);
    }

    const devHighlight = getComponentValueStrict(DevHighlight, entity);
    const position = getComponentValueStrict(LocalPosition, entity);
    const highlight = objectPool.get(`${entity}-dev-highlight`, "Rectangle");

    highlight.setComponent({
      id: `highlight`,
      once: (box) => {
        const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

        box.setFillStyle(devHighlight.value ?? 0xf0e71d, 0.5);
        box.setSize(tileWidth, tileHeight);
        box.setPosition(pixelCoord.x, pixelCoord.y);
      },
    });
  });
}
