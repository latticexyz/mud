import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { map } from "rxjs";
import { Has, runQuery } from "@latticexyz/recs";
import { Direction } from "../../../../../constants";

export function createInputSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input, maps },
    },
    api: { highlightCoord },
    parentLayers: {
      headless: {
        api: { moveEntity },
      },
      local: {
        components: { Selected },
      },
    },
  } = layer;

  const move = function (direction: Direction) {
    const selectedEntity = [...runQuery([Has(Selected)])][0];
    if (!selectedEntity) return;
    moveEntity(selectedEntity, direction);
  };

  input.onKeyPress(
    (keys) => keys.has("UP"),
    () => move(Direction.Top)
  );

  input.onKeyPress(
    (keys) => keys.has("LEFT"),
    () => move(Direction.Left)
  );

  input.onKeyPress(
    (keys) => keys.has("DOWN"),
    () => move(Direction.Bottom)
  );

  input.onKeyPress(
    (keys) => keys.has("RIGHT"),
    () => move(Direction.Right)
  );

  input.pointermove$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)) // Map pixel coord to tile coord
    )
    .subscribe((coord) => {
      highlightCoord(coord);
    });
}
