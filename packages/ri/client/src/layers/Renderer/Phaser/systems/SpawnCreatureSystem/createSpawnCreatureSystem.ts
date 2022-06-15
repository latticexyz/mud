import { getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createSpawnCreatureSystem(layer: PhaserLayer) {
  const {
    scenes: {
      Main: { input },
    },
    parentLayers: {
      local: {
        singletonEntity,
        components: { Selection },
      },
      network: {
        api: { spawnCreature },
      },
    },
  } = layer;

  // Reset selected area on ECS click
  input.onKeyPress(
    (keys) => keys.has("S"),
    () => {
      console.log("spawning creature");
      const selectedArea = getComponentValue(Selection, singletonEntity);
      if (!selectedArea) return;

      const randomX = Phaser.Math.RND.integerInRange(selectedArea.x, selectedArea.x + selectedArea.width);
      const randomY = Phaser.Math.RND.integerInRange(selectedArea.y, selectedArea.y + selectedArea.height);

      spawnCreature({ x: randomX, y: randomY });
    }
  );
}
