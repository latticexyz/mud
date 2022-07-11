import React from "react";
import { registerUIComponent } from "../engine";
import { defineQuery, getComponentValue, Has } from "@latticexyz/recs";
import { getAddressColor } from "@latticexyz/std-client";
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
          components: { OwnedBy },
        },
      } = layers;

      const dataQuery = defineQuery([Has(Selected)]);

      return merge(dataQuery.update$, Selection.update$).pipe(
        map(() => {
          const selection = getComponentValue(Selection, singletonEntity);
          const selectedEntity = [...dataQuery.matching][0];
          const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;

          return {
            selection,
            ownedBy,
          };
        })
      );
    },
    ({ selection, ownedBy }) => {
      return (
        <>
          x: {selection?.x}
          <br />
          y: {selection?.y}
          <br />
          {ownedBy && <p style={{ color: getAddressColor(ownedBy).toString(16) }}>{`owned by: ${ownedBy}`}</p>}
          <br />
        </>
      );
    }
  );
}
