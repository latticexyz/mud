import { PhaserLayer } from "../../types";
import { defineComponentSystem } from "@latticexyz/recs";
import { worldCoordToPixel } from "../../utils";

const SELECTION_OUTLINE = "SELECTION_OUTLINE";
const OUTLINE = "OUTLINE";

export function createSelectionOutlineSystem(layer: PhaserLayer) {
  //
  const {
    world,
    scenes: {
      Main: {
        objectPool,
        maps: { Main },
      },
    },
    parentLayers: {
      local: {
        components: { Selection },
      },
    },
  } = layer;

  defineComponentSystem(world, Selection, ({ value }) => {
    const selection = value[0];
    const outline = objectPool.get(SELECTION_OUTLINE, "Rectangle");

    if (!selection || (selection.height === 0 && selection.width === 0)) {
      return outline.removeComponent(OUTLINE);
    }

    const pixelCoord = worldCoordToPixel(Main, selection);

    outline.setComponent({
      id: OUTLINE,
      once: (rectangle) => {
        rectangle.setX(pixelCoord.x);
        rectangle.setY(pixelCoord.y);
        rectangle.width = selection.width * Main.tileWidth;
        rectangle.height = selection.height * Main.tileHeight;
        rectangle.setFillStyle(0x00ff00, 0.3);
      },
    });
  });
}
