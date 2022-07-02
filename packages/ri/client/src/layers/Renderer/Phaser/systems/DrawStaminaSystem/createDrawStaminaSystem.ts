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

  defineSystem(world, [Has(LocalPosition), Has(LocalStamina), Has(Stamina)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      objectPool.remove(`${entity}-stamina`);
    } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const currentStamina = getComponentValueStrict(LocalStamina, entity).current;
      const maxStamina = getComponentValueStrict(Stamina, entity).max;
      const position = getComponentValueStrict(LocalPosition, entity);

      const highlight = objectPool.get(`${entity}-stamina`, "Text");
      highlight.setComponent({
        id: "stamina-text",
        once: (staminaText) => {
          const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

          staminaText.setFontSize(8);
          staminaText.setText(`${currentStamina} / ${maxStamina}`);
          staminaText.setPosition(pixelCoord.x, pixelCoord.y + tileHeight);
        },
      });
    }
  });
}
