import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { map } from "rxjs";

export function createInputSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input, maps },
    },
    parentLayers: {
      headless: {
        api: { moveEntity, joinGame },
      },
    },
  } = layer;

  input.onKeyPress(
    (keys) => keys.has("UP"),
    () => moveEntity("Up")
  );

  input.onKeyPress(
    (keys) => keys.has("LEFT"),
    () => moveEntity("Left")
  );

  input.onKeyPress(
    (keys) => keys.has("DOWN"),
    () => moveEntity("Down")
  );

  input.onKeyPress(
    (keys) => keys.has("RIGHT"),
    () => moveEntity("Right")
  );

  input.click$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)) // Map pixel coord to tile coord
    )
    .subscribe((coord) => {
      joinGame(coord);
    });
}
