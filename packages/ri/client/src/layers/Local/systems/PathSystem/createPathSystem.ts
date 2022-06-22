import { Entity, getComponentValue, removeComponent, setComponent, defineComponentSystem } from "@latticexyz/recs";
import { DEFAULT_MOVE_SPEED, FAST_MOVE_SPEED } from "../../constants";
import { LocalLayer } from "../../types";
import { concatMap, find, from, of, zipWith } from "rxjs";
import { delayTime } from "../../../../utils/rx";

/**
 * The Path system handles moving entities along the path defined in their Path component.
 */
export function createPathSystem(layer: LocalLayer) {
  const {
    world,
    components: { Path, LocalPosition, MoveSpeed },
  } = layer;

  function increaseMoveSpeed(entity: Entity) {
    const moveSpeed = getComponentValue(MoveSpeed, entity) || {
      default: DEFAULT_MOVE_SPEED,
      current: DEFAULT_MOVE_SPEED,
    };
    setComponent(MoveSpeed, entity, { ...moveSpeed, current: FAST_MOVE_SPEED });
  }

  function resetMoveSpeed(entity: Entity) {
    const moveSpeed = getComponentValue(MoveSpeed, entity) || {
      default: DEFAULT_MOVE_SPEED,
      current: DEFAULT_MOVE_SPEED,
    };
    setComponent(MoveSpeed, entity, { ...moveSpeed, current: moveSpeed.default });
  }

  defineComponentSystem(world, Path, (update) => {
    const path = update.value[0];
    if (!path) return;

    increaseMoveSpeed(update.entity);

    const positionStream = from(path.x).pipe(
      zipWith(from(path.y)), // Transform coords into format [x,y]
      concatMap((position) => of(position).pipe(delayTime(FAST_MOVE_SPEED))) // Emit one coord every 1000ms
    );

    const moveSubscription = positionStream.subscribe({
      next: ([x, y]) => setComponent(LocalPosition, update.entity, { x, y }), // Set the new position
      complete: () => {
        removeComponent(Path, update.entity); // Remove Path component once the path is traversed
        resetMoveSpeed(update.entity);
      },
    });

    // Stop previous traversal if there is a new path
    const updateSubscription = Path.update$
      .pipe(find((newValue) => newValue.entity === update.entity))
      .subscribe(() => {
        moveSubscription?.unsubscribe();
      });

    world.registerDisposer(() => {
      moveSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
    });
  });
}
