import { defineQuery, defineSystem, getComponentValueStrict, Has, setComponent } from "@latticexyz/recs";
import { HasValue, Not, Entity } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { WorldCoord } from "../../../../types";
import { randomValidStep } from "../../utils";
import { Time } from "../../../../utils/time";

/**
 * The Strolling system handles moving entites with Strolling component to a random valid location once a second
 */
export function createStrollingSystem(layer: LocalLayer) {
  const {
    world,
    components: { Strolling, LocalPosition, Destination, Path },
    parentLayers: {
      network: {
        components: { Position, MinedTag, Untraversable },
      },
    },
  } = layer;

  function isTraversableBy(entity: Entity) {
    return (coord: WorldCoord) => {
      const traversable = defineQuery([HasValue(Position, coord), Has(MinedTag), Not(Untraversable)]).get().size > 0;
      if (traversable) return true;

      const partiallyTraversables = defineQuery([HasValue(Position, coord), Has(MinedTag), Has(Untraversable)]).get();
      if (partiallyTraversables.size === 0) return false;

      const partiallyTraversable = [...partiallyTraversables][0];

      return getComponentValueStrict(Untraversable, partiallyTraversable).traversableBy.includes(entity);
    };
  }

  const strollingEntities = defineQuery([Has(Strolling), Has(LocalPosition), Not(Destination), Not(Path)]);

  const stroll = defineSystem(world, () => {
    for (const entity of strollingEntities.get()) {
      const position = getComponentValueStrict(LocalPosition, entity);
      const newPosition = randomValidStep(position, [isTraversableBy(entity)]);
      if (!newPosition) continue;
      setComponent(LocalPosition, entity, newPosition);
    }
  });

  const dispose = Time.time.setInterval(stroll, 1000);
  world.registerDisposer(dispose);
}
