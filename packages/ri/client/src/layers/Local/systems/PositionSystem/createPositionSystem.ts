import { defineReactionSystem, defineUpdateQuery, getComponentValueStrict, Has, setComponent } from "@mudkit/recs";
import { LocalLayer } from "../../types";

/**
 * The Position system handles adding the Destination component to entities if their network layer Position changed.
 */
export function createPositionSystem(layer: LocalLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position },
      },
    },
    components: { Destination },
  } = layer;

  const updateQuery = defineUpdateQuery(world, [Has(Position)], { runOnInit: true });

  defineReactionSystem(
    world,
    () => updateQuery.get(),
    (movedEntities) => {
      for (const entity of movedEntities) {
        const position = getComponentValueStrict(Position, entity);
        setComponent(Destination, entity, position);
      }
    }
  );
}
