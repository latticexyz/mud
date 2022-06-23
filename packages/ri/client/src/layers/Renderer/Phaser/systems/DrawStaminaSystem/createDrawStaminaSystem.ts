import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineSystem, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

export function createDrawStaminaSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { MaxStamina },
      },
      local: {
        components: { LocalPosition },
      },
      headless: {
        components: { LocalCurrentStamina },
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

  defineSystem(world, [Has(LocalPosition), Has(LocalCurrentStamina), Has(MaxStamina)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      objectPool.remove(`${entity}-stamina`);
    } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const currentStamina = getComponentValueStrict(LocalCurrentStamina, entity).value;
      const maxStamina = getComponentValueStrict(MaxStamina, entity).value;
      const position = getComponentValueStrict(LocalPosition, entity);

      const highlight = objectPool.get(`${entity}-stamina`, "Text");
      highlight.setComponent({
        id: "stamina-text",
        once: (staminaText) => {
          const pixelCoord = tileCoordToPixelCoord(position, tileWidth, tileHeight);

          staminaText.setText(`${currentStamina} / ${maxStamina}`);
          staminaText.setPosition(pixelCoord.x, pixelCoord.y + tileHeight);
        },
      });
    }
  });
}
