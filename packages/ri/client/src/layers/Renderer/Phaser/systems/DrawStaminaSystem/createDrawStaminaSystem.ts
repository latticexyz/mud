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

      const highlight = objectPool.get(`${entity}-stamina`, "Text");
      highlight.setComponent({
        id: "stamina-text",
        once: (staminaText) => {
          const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

          staminaText.setFontSize(8);
          staminaText.setText(`${currentStamina} / ${stamina.max}`);
          staminaText.setPosition(pixelCoord.x - 5, pixelCoord.y + tileHeight);
        },
      });
    }
  });
}
