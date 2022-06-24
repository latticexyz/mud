import React from "react";
import { registerUIComponent } from "../engine";
import { getComponentValue, Has, runQuery } from "@latticexyz/recs";

export function registerSelection() {
  registerUIComponent(
    "SelectedCoords",
    {
      rowStart: 4,
      rowEnd: 4,
      colStart: 1,
      colEnd: 1,
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
      const selection = getComponentValue(Selection, singletonEntity);

      const getPersonaOfOwner = (selectedEntity: number) => {
        const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
        if (!ownedBy) return null;
        const ownerEntityIndex = layers.network.world.entityToIndex.get(ownedBy);
        if (!ownerEntityIndex) return null;

        return getComponentValue(Persona, ownerEntityIndex)?.value;
      };

      const selectedEntity = [...runQuery([Has(Selected)])][0];

      return {
        selection,
        selectedEntity: {
          ownerPersonaId: getPersonaOfOwner(selectedEntity),
        },
      };
    },
    ({ selection, selectedEntity }) => {
      return (
        <>
          x: {selection?.x}
          <br />
          y: {selection?.y}
          <br />
          {selectedEntity.ownerPersonaId && `owner persona: ${selectedEntity.ownerPersonaId}`}
          <br />
        </>
      );
    }
  );
}
