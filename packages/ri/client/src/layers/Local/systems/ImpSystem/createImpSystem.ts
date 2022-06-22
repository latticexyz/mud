import { createEntity, runQuery, withValue } from "@latticexyz/recs";
import { HasValue } from "@latticexyz/recs";
import { random } from "@latticexyz/utils";
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

  function getNumImps() {
    return runQuery([HasValue(LocalEntityType, { entityType: LocalEntityTypes.Imp })]).size;
  }

  function createImp() {
    if (getNumImps() > 5) return;

    const coord = {
      x: random(7),
      y: random(7),
    };

    createEntity(
      world,
      [
        withValue(LocalEntityType, { entityType: LocalEntityTypes.Imp }),
        withValue(Strolling, { value: true }),
        withValue(LocalPosition, coord),
        withValue(MoveSpeed, { default: 500, current: 500 }),
        withValue(Selectable, { value: true }), // Remove this later, imps are not selectable
      ],
      { idSuffix: "imp" }
    );
  }

  const dispose = Time.time.setInterval(createImp, 1000);
  world.registerDisposer(dispose);
}
