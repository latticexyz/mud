import { defineReactionSystem, getComponentValue, defineQuery, Has, removeComponent, setComponent } from "@mud/recs";
import { LocalLayer } from "../../types";
import { areaContains } from "@mud/utils";

/**
 * The Selection system handles selecting all selectable entities in the selected area
 */
export function createSelectionSystem(layer: LocalLayer) {
  const {
    world,
    components: { LocalPosition, Selectable, Selection, Selected },
    singletonEntity,
    parentLayers: {
      network: {
        components: { Position },
      },
    },
  } = layer;

  const selectableEntities = defineQuery([Has(Selectable)]);
  const selectedEntities = defineQuery([Has(Selected)]);

  // Get all selectable entities in the selected area
  defineReactionSystem(
    world,
    () => getComponentValue(Selection, singletonEntity),
    (selection) => {
      if (!selection) return;

      // If the selection is empty, unselect all currently selected entities
      if (selection.width === 0 || selection.height === 0) {
        for (const entity of selectedEntities.get()) {
          removeComponent(Selected, entity);
        }
        return;
      }

      // If the selection is not empty, select all selectable entities in the area
      // TODO: we need a range indexer here. Linear query will have performance problems with many entities.
      // https://linear.app/latticexyz/issue/LAT-495/add-indexer-for-range-queries-to-mobx-ecs
      for (const entity of selectableEntities.get()) {
        const position = getComponentValue(LocalPosition, entity) || getComponentValue(Position, entity);
        if (!position) continue;
        if (areaContains(selection, position)) {
          setComponent(Selected, entity, {});
        }
      }
    }
  );
}
