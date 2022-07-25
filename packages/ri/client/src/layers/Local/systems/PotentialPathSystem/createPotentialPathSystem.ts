import { defineSystem, getComponentValue, Has, removeComponent, setComponent, UpdateType } from "@latticexyz/recs";
import { isUntraversable } from "@latticexyz/std-client";
import { BFS } from "../../../../utils/pathfinding";
import { LocalLayer } from "../../types";
import { WorldCoord } from "../../../../types";

export function createPotentialPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Selected, PotentialPath, LocalPosition },
    parentLayers: {
      headless: {
        components: { LocalStamina },
        actions: { withOptimisticUpdates },
      },
      network: {
        components: { Movable, Untraversable, Stamina },
      },
    },
  } = layer;

  const OptimisticStamina = withOptimisticUpdates(Stamina);

  defineSystem(
    world,
    [Has(Selected), Has(LocalPosition), Has(LocalStamina), Has(OptimisticStamina)],
    ({ type, entity }) => {
      const localStamina = getComponentValue(LocalStamina, entity);
      if (!localStamina) return;

      const stamina = getComponentValue(OptimisticStamina, entity);
      if (!stamina) return;

      const currentStamina = localStamina.current + stamina.current;

      if (type === UpdateType.Exit || currentStamina === 0) {
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

        const isUntraversableFunc = (targetPosition: WorldCoord) =>
          isUntraversable(Untraversable, LocalPosition, targetPosition);
        const paths = BFS(localPosition, moveSpeed, isUntraversableFunc);

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
    }
  );
}
