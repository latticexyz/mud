import { createEntity, defineQuery, defineSystem, withValue } from "@mudkit/recs";
import { HasValue } from "@mudkit/recs";
import { random } from "@mudkit/utils";
import { Time } from "../../../../utils/time";
import { LocalEntityTypes, LocalLayer } from "../../types";

/**
 * The Imp system handles spawning imps once a second until the max population is reached.
 */
export function createImpSystem(layer: LocalLayer) {
  const {
    world,
    components: { Strolling, LocalEntityType, LocalPosition, MoveSpeed, Selectable },
  } = layer;

  const imps = defineQuery([HasValue(LocalEntityType, { entityType: LocalEntityTypes.Imp })]);

  const createImp = defineSystem(world, () => {
    if (imps.get().size > 5) return;
    const coord = {
      x: random(7),
      y: random(7),
    };

    createEntity(world, [
      withValue(LocalEntityType, { entityType: LocalEntityTypes.Imp }),
      withValue(Strolling, {}),
      withValue(LocalPosition, coord),
      withValue(MoveSpeed, { default: 500, current: 500 }),
      withValue(Selectable, {}), // Remove this later, imps are not selectable
    ]);
  });

  const dispose = Time.time.setInterval(createImp, 1000);
  world.registerDisposer(dispose);
}
