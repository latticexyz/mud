import { Entity, getComponentValue, removeComponent, setComponent, defineRxSystem } from "@mudkit/recs";
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

  defineRxSystem(world, Path, (stream$) => {
    return stream$.subscribe(({ entity, value: path }) => {
      if (!path) return;

      increaseMoveSpeed(entity);

      const positionStream = from(path.x).pipe(
        zipWith(from(path.y)), // Transform coords into format [x,y]
        concatMap((position) => of(position).pipe(delayTime(FAST_MOVE_SPEED))) // Emit one coord every 1000ms
      );

      const moveSubscription = positionStream.subscribe({
        next: ([x, y]) => setComponent(LocalPosition, entity, { x, y }), // Set the new position
        complete: () => {
          removeComponent(Path, entity); // Remove Path component once the path is traversed
          resetMoveSpeed(entity);
        },
      });

      // Stop previous traversal if there is a new path
      stream$.pipe(find((newValue) => newValue.entity === entity)).subscribe(() => {
        moveSubscription.unsubscribe();
      });
    });
  });
}
