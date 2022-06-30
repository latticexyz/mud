import { defineSystem, getComponentValue, Has, removeComponent, setComponent, UpdateType } from "@latticexyz/recs";
import { LocalLayer } from "../../types";

export function createPotentialPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, PotentialPath, LocalPosition },
    parentLayers: {
      headless: {
        components: { LocalStamina },
      },
    },
  } = layer;

  defineSystem(world, [Has(Selected), Has(LocalPosition), Has(LocalStamina)], ({ type, entity }) => {
    const currentStamina = getComponentValue(LocalStamina, entity);

    if (type === UpdateType.Exit || currentStamina?.current === 0) {
      removeComponent(PotentialPath, entity);
    } else if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const position = getComponentValue(LocalPosition, entity);
      if (!position) return;

      // TODO replace with dynamic move distance and pathfinding
      const potentialPaths = {
        x: [position.x + 1, position.x - 1, position.x, position.x],
        y: [position.y, position.y, position.y + 1, position.y - 1],
      };
      setComponent(PotentialPath, entity, potentialPaths);
    }
  });
}
