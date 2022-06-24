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
          id: `highlight`,
          once: (box) => {
            const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

            box.setFillStyle(0xf0e71d, 0.3);
            box.setSize(tileWidth, tileHeight);
            box.setPosition(pixelCoord.x + tileWidth / 2, pixelCoord.y + tileHeight / 2);
            box.setDepth(0);
          },
        });
      }
    } else {
      if (!previousPaths) return;

      for (let i = 0; i < previousPaths.x.length; i++) {
        objectPool.remove(`${entity}-path-highlight-${i}`);
      }
    }
  });
}
