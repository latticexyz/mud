import { PhaserLayer } from "../../types";
import { defineReactionSystem, getComponentValue } from "@latticexyz/recs";
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
        singletonEntity,
      },
    },
  } = layer;

  defineReactionSystem(
    world,
    () => getComponentValue(Selection, singletonEntity),
    (selection) => {
      const outline = objectPool.get(SELECTION_OUTLINE, "Rectangle");

      if (!selection || (selection.height === 0 && selection.width === 0)) {
        outline.removeComponent(OUTLINE);
        return;
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
    }
  );
}
