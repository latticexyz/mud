import { map, merge, pairwise } from "rxjs";
import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";

const SELECTION = "SELECTION";
const DRAG = "DRAG";

export function createSelectionSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { objectPool, input, maps },
    },
    parentLayers: {
      local: {
        api: { selectArea, resetSelection },
      },
    },
  } = layer;

  const dragSub = merge(input.drag$, input.pointerup$.pipe(map(() => undefined)))
    .pipe(pairwise())
    .subscribe(([prev, curr]) => {
      // Don't drag if this map is not visible
      if (!maps.Main.visible.current) return;

      // Draw the currently selected area
      if (curr) {
        const selection = objectPool.get(SELECTION, "Rectangle");
        selection.setComponent({
          id: DRAG,
          once: (rectangle) => {
            rectangle.setX(curr.x);
            rectangle.setY(curr.y);
            rectangle.width = curr.width;
            rectangle.height = curr.height;
            rectangle.setFillStyle(0x000000, 0.5);
          },
        });
      }

      // Remove current selection if a new selection starts
      if (!curr) objectPool.remove(SELECTION);

      // If the selection just ended, confirm it by sending it to the local layer
      if (!curr && prev) {
        // Normalize the area to start top left and have positive x/y
        const area = { ...prev };
        if (area.width < 0) {
          area.x += area.width;
          area.width = Math.abs(area.width);
        }

        if (area.height < 0) {
          area.y += area.height;
          area.height = Math.abs(area.height);
        }

        // Set the selection in the local layer
        const topLeftPixel = { x: area.x, y: area.y };
        const bottomRightPixel = { x: area.x + area.width, y: area.y + area.height };
        const topLeftTile = pixelToWorldCoord(maps.Main, topLeftPixel);
        const bottomRightTile = pixelToWorldCoord(maps.Main, bottomRightPixel);
        const tileArea = {
          x: topLeftTile.x,
          y: topLeftTile.y,
          width: bottomRightTile.x - topLeftTile.x + 1,
          height: bottomRightTile.y - topLeftTile.y + 1,
        };
        selectArea(tileArea);
      }
    });

  // Reset selected area on pointerdown unless shift is pressed
  const unselectSub = input.pointerdown$.subscribe(() => {
    if (!input.pressedKeys.has("SHIFT")) resetSelection();
  });

  // Reset selected area on ECS click
  input.onKeyPress(
    (keys) => keys.has("ESC"),
    () => {
      console.log("esc");
      resetSelection();
    }
  );

  // Select 1x1 area on click
  const clickSub = input.click$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })),
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)),
      map((worldCoord) => ({ ...worldCoord, width: 1, height: 1 }))
    )
    .subscribe(selectArea);

  world.registerDisposer(() => {
    dragSub?.unsubscribe();
    unselectSub?.unsubscribe();
    clickSub?.unsubscribe();
  });
}
