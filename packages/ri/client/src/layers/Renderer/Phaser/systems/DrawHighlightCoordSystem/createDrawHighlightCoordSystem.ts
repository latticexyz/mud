import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineUpdateSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawHighlightCoordSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      local: { singletonEntity },
    },
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
    components: { HoverHighlight },
  } = layer;

  defineUpdateSystem(world, [Has(HoverHighlight)], ({ entity }) => {
    const hoverHighlght = getComponentValueStrict(HoverHighlight, singletonEntity);
    const highlight = objectPool.get(`${entity}-hover-highlight`, "Rectangle");
    if (hoverHighlght.x === null || hoverHighlght.y === null) return;
    const position = { x: hoverHighlght.x, y: hoverHighlght.y };

    highlight.setComponent({
      id: `highlight`,
      once: (box) => {
        const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

        // box.setVisible(true);
        box.setStrokeStyle(3, hoverHighlght.color ?? 0xf0e71d, 0.5);
        box.setSize(tileWidth, tileHeight);
        box.setPosition(pixelCoord.x + tileWidth / 2, pixelCoord.y + tileHeight / 2);
      },
    });
  });
}
