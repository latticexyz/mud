import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { map } from "rxjs";
import { Has, runQuery } from "@latticexyz/recs";

export function createInputSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input, maps },
    },
    api: { highlightCoord },
    parentLayers: {
      headless: {
        api: { moveEntity, joinGame },
      },
      local: {
        components: { Selected },
      },
    },
  } = layer;

  const move = function (direction: string) {
    const selectedEntity = [...runQuery([Has(Selected)])][0];
    if (!selectedEntity) return;
    moveEntity(selectedEntity, direction);
  };

  input.onKeyPress(
    (keys) => keys.has("UP"),
    () => move("Up")
  );

  input.onKeyPress(
    (keys) => keys.has("LEFT"),
    () => move("Left")
  );

  input.onKeyPress(
    (keys) => keys.has("DOWN"),
    () => move("Down")
  );

  input.onKeyPress(
    (keys) => keys.has("RIGHT"),
    () => move("Right")
  );

  input.pointermove$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)) // Map pixel coord to tile coord
    )
    .subscribe((coord) => {
      highlightCoord(coord);
    });

  input.click$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)) // Map pixel coord to tile coord
    )
    .subscribe((coord) => {
      joinGame(coord);
    });
}
