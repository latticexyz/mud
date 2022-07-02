import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawPotentialPathSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      local: {
        components: { PotentialPath, LocalPosition },
      },
    },
    scenes: {
      Main: {
        objectPool,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = layer;

  defineComponentSystem(world, PotentialPath, ({ entity, value }) => {
    const [potentialPaths, previousPaths] = value;

    if (previousPaths) {
      for (let i = 0; i < previousPaths.x.length; i++) {
        // Remove the highlight component from this game object, but don't remove the game object itself (since we can reuse it below)
        const highlight = objectPool.get(`${entity}-path-highlight-${i}`, "Rectangle");
        highlight.removeComponent("path-highlight");
      }
    }

    if (potentialPaths) {
      // add current entity position to paths just to look good
      const position = getComponentValue(LocalPosition, entity);
      if (!position) return;
      potentialPaths.x.push(position.x);
      potentialPaths.y.push(position.y);

      for (let i = 0; i < potentialPaths.x.length; i++) {
        const pathHighlight = objectPool.get(`${entity}-path-highlight-${i}`, "Rectangle");
        const position = { x: potentialPaths.x[i], y: potentialPaths.y[i] };

        pathHighlight.setComponent({
          id: `path-highlight`,
          once: (box) => {
            const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);
            box.setFillStyle(0xf0e71d, 0.3);
            box.setSize(tileWidth, tileHeight);
            box.setPosition(pixelCoord.x, pixelCoord.y);
            box.setDepth(0);
          },
        });
      }
    }
  });
}
