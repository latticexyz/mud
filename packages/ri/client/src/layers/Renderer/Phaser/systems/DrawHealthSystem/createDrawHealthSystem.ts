import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineSystem, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawHealthSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Combat },
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

  defineSystem(world, [Has(LocalPosition), Has(Combat)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      objectPool.remove(`${entity}-health`);
    } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const combat = getComponentValueStrict(Combat, entity);
      const position = getComponentValueStrict(LocalPosition, entity);

      const highlight = objectPool.get(`${entity}-health`, "Rectangle");
      highlight.setComponent({
        id: "health-bar",
        once: (healthBar) => {
          const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

          const healthPercent = combat.health / 100_000;
          healthBar.width = (tileWidth - 2) * healthPercent;
          healthBar.height = 2;

          let color = 0x00ff00;
          if (healthPercent < 0.75) color = 0xffff00;
          if (healthPercent < 0.5) color = 0xffa500;
          if (healthPercent < 0.25) color = 0xff0000;

          healthBar.setFillStyle(color);
          healthBar.setPosition(pixelCoord.x + 1, pixelCoord.y);
        },
      });
    }
  });
}
