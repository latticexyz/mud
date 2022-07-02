import { map } from "rxjs";
import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";

export function createSelectionSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { input, maps },
    },
    parentLayers: {
      local: {
        api: { selectArea, resetSelection },
      },
    },
  } = layer;

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
    .subscribe((area) => {
      resetSelection();
      selectArea(area);
    });

  world.registerDisposer(() => {
    clickSub?.unsubscribe();
  });
}
