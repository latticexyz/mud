import { defineComponentSystem, setComponent } from "@latticexyz/recs";
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

  defineComponentSystem(world, Position, ({ entity, value }) => {
    if (value[0]) setComponent(Destination, entity, value[0]);
  });
}
