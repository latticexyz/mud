import { PhaserLayer } from "../../types";
import { pixelToWorldCoord } from "../../utils";
import { map } from "rxjs";
import { getComponentValueStrict, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Direction } from "../../../../../constants";
import { WorldCoord } from "../../../../../types";

export function createInputSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input, maps },
    },
    components: { HoverHighlight },
    api: { highlightCoord },
    parentLayers: {
      headless: {
        api: { moveEntity, attackEntity },
      },
      local: {
        singletonEntity,
        components: { Selected, LocalPosition },
      },
    },
  } = layer;

  const getSelectedEntity = () => [...runQuery([Has(Selected)])][0];

  const move = function (targetPosition: WorldCoord) {
    const selectedEntity = getSelectedEntity();
    if (!selectedEntity) return;
    moveEntity(selectedEntity, targetPosition);
  };

  input.onKeyPress(
    (keys) => keys.has("A"),
    () => {
      const selectedEntity = getSelectedEntity();
      if (!selectedEntity) return;

      const hoverHighlight = getComponentValueStrict(HoverHighlight, singletonEntity);
      const highlightedEntity = [
        ...runQuery([HasValue(LocalPosition, { x: hoverHighlight.x, y: hoverHighlight.y })]),
      ][0];
      if (!highlightedEntity) return;

      attackEntity(selectedEntity, highlightedEntity);
    }
  );

  input.pointermove$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })), // Map pointer to pointer pixel cood
      map((pixel) => pixelToWorldCoord(maps.Main, pixel)) // Map pixel coord to tile coord
    )
    .subscribe((coord) => {
      highlightCoord(coord);
    });

  input.rightClick$
    .pipe(
      map((pointer) => ({ x: pointer.worldX, y: pointer.worldY })),
      map((pixel) => pixelToWorldCoord(maps.Main, pixel))
    )
    .subscribe((coord) => {
      move(coord);
    });
}
