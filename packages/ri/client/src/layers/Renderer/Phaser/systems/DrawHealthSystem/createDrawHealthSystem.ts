import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineSystem, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawHealthSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Health },
      },
      local: {
        components: { LocalPosition },
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

  defineSystem(world, [Has(LocalPosition), Has(Health)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      objectPool.remove(`${entity}-health`);
    } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const health = getComponentValueStrict(Health, entity);
      const position = getComponentValueStrict(LocalPosition, entity);

      const highlight = objectPool.get(`${entity}-health`, "Text");
      highlight.setComponent({
        id: "health-text",
        once: (healthText) => {
          const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

          healthText.setFontSize(12);
          healthText.setText(`${Math.round(health.current / 10_000)}`);
          healthText.setPosition(pixelCoord.x, pixelCoord.y - 10);
        },
      });
    }
  });
}
