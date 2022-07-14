import { defineSystem, getComponentValue, Has, removeComponent, setComponent, UpdateType } from "@latticexyz/recs";
import { BFS } from "../../../../utils/pathfinding";
import { LocalLayer } from "../../types";

export function createPotentialPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, PotentialPath, LocalPosition },
    parentLayers: {
      headless: {
        components: { LocalStamina },
      },
      network: {
        components: { Movable },
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

      const moveSpeed = getComponentValue(Movable, entity)?.value;
      if (!moveSpeed) return;

      const localPosition = getComponentValue(LocalPosition, entity);
      if (!localPosition) return;

      const xArray: number[] = [];
      const yArray: number[] = [];

      const paths = BFS(localPosition, moveSpeed, layer.parentLayers.network, LocalPosition);

      for (const coord of paths) {
        xArray.push(coord.x);
        yArray.push(coord.y);
      }

      const potentialPaths = {
        x: xArray,
        y: yArray,
      };
      setComponent(PotentialPath, entity, potentialPaths);
    }
  });
}
