import React from "react";
import { registerUIComponent } from "../engine";
import { defineQuery, EntityIndex, getComponentValue, Has } from "@latticexyz/recs";
import { getPersonaColor } from "@latticexyz/std-client";
import { map, merge } from "rxjs";

export function registerSelection() {
  registerUIComponent(
    "SelectedCoords",
    {
      rowStart: 11,
      rowEnd: 13,
      colStart: 1,
      colEnd: 2,
    },
    (layers) => {
      const {
        local: {
          components: { Selection, Selected },
          singletonEntity,
        },
        network: {
          components: { OwnedBy, Persona },
        },
      } = layers;

      const dataQuery = defineQuery([Has(Selected)]);
      return merge(dataQuery.update$, Selection.update$).pipe(
        map(() => {
          const selection = getComponentValue(Selection, singletonEntity);

          const getPersonaOfOwner = (selectedEntity: EntityIndex) => {
            const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
            if (!ownedBy) return undefined;
            const ownerEntityIndex = layers.network.world.entityToIndex.get(ownedBy);
            if (!ownerEntityIndex) return undefined;

            return getComponentValue(Persona, ownerEntityIndex)?.value;
          };

          const selectedEntities = dataQuery.matching;
          const selectedEntity = [...selectedEntities][0];
          const ownerPersonaId = getPersonaOfOwner(selectedEntity);

          return {
            selection,
            selectedEntity: {
              ownerPersonaId,
            },
          };
        })
      );
    },
    ({ selection, selectedEntity }) => {
      return (
        <>
          x: {selection?.x}
          <br />
          y: {selection?.y}
          <br />
          {selectedEntity?.ownerPersonaId && (
            <p
              style={{ color: getPersonaColor(selectedEntity.ownerPersonaId).toString(16) }}
            >{`owner persona: ${selectedEntity.ownerPersonaId}`}</p>
          )}
          <br />
        </>
      );
    }
  );
}
