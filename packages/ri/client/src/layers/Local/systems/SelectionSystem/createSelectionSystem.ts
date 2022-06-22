import {
  getComponentValue,
  removeComponent,
  setComponent,
  defineComponentSystem,
  getComponentEntities,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { areaContains } from "@latticexyz/utils";

/**
 * The Selection system handles selecting all selectable entities in the selected area
 */
export function createSelectionSystem(layer: LocalLayer) {
  const {
    world,
    components: { LocalPosition, Selectable, Selection, Selected },
    parentLayers: {
      network: {
        components: { Position },
      },
    },
  } = layer;

  // Get all selectable entities in the selected area
  defineComponentSystem(world, Selection, ({ value }) => {
    const selection = value[0];
    if (!selection) return;

    // If the selection is empty, unselect all currently selected entities
    if (selection.width === 0 || selection.height === 0) {
      for (const entity of getComponentEntities(Selected)) {
        removeComponent(Selected, entity);
      }
      return;
    }

    // If the selection is not empty, select all selectable entities in the area
    // TODO: we need a range indexer here. Linear query will have performance problems with many entities.
    // https://linear.app/latticexyz/issue/LAT-495/add-indexer-for-range-queries-to-mobx-ecs
    for (const entity of getComponentEntities(Selectable)) {
      const position = getComponentValue(LocalPosition, entity) || getComponentValue(Position, entity);
      if (!position) continue;
      if (areaContains(selection, position)) {
        setComponent(Selected, entity, { value: true });
      }
    }
  });
}
