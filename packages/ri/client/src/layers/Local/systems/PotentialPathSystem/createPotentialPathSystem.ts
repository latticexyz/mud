import { defineSystem, getComponentValue, Has, removeComponent, setComponent, UpdateType } from "@latticexyz/recs";
import { WorldCoord } from "../../../../types";
import { aStar } from "../../../../utils/pathfinding";
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

      // TODO replace with dynamic move distance and pathfinding
      const localPosition = getComponentValue(LocalPosition, entity);
      if (!localPosition) return;

      const localStamina = getComponentValue(LocalStamina, entity);
      if (!localStamina) return;

      const netStamina = localStamina.current as number;
      if (!netStamina) {
        return;
      }

      const xArray: number[] = [];
      const yArray: number[] = [];

      const paths = new Set<string>();

      const maxDistance = moveSpeed + 1;
      for (let x = 0; x < maxDistance * 2; x++) {
        for (let y = 0; y < maxDistance * 2; y++) {
          const zero = { x: localPosition.x - maxDistance, y: localPosition.y - maxDistance };
          const destination = { x: x + zero.x, y: y + zero.y };
          const path = aStar(localPosition, destination, maxDistance, layer.parentLayers.network, LocalPosition);

          for (const coord of path) paths.add(JSON.stringify(coord)); // hack to get a set of coordinates
        }
      }

      for (const coord of paths) {
        const c = JSON.parse(coord);
        xArray.push(c.x);
        yArray.push(c.y);
      }

      const potentialPaths = {
        x: xArray,
        y: yArray,
      };
      setComponent(PotentialPath, entity, potentialPaths);
    }
  });
}
