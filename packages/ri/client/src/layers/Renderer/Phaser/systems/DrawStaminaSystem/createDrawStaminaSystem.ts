import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineSystem, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawStaminaSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Stamina },
      },
      local: {
        components: { LocalPosition },
      },
      headless: {
        components: { LocalStamina },
        actions: { withOptimisticUpdates },
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

  const OptimisticStamina = withOptimisticUpdates(Stamina);

  defineSystem(world, [Has(LocalPosition), Has(LocalStamina), Has(OptimisticStamina)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      objectPool.remove(`${entity}-stamina`);
    } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const stamina = getComponentValueStrict(OptimisticStamina, entity);
      const currentStamina = getComponentValueStrict(LocalStamina, entity).current + stamina.current;
      const position = getComponentValueStrict(LocalPosition, entity);

      const bar = objectPool.get(`${entity}-stamina`, "Rectangle");
      bar.setComponent({
        id: "stamina-bar",
        once: (staminaBar) => {
          const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

          const staminaPercent = currentStamina / stamina.max;
          staminaBar.width = (tileWidth - 2) * staminaPercent;
          staminaBar.height = 2;

          staminaBar.setFillStyle(0xffffff);
          staminaBar.setPosition(pixelCoord.x + 1, pixelCoord.y + tileHeight - 2);
        },
      });
    }
  });
}
