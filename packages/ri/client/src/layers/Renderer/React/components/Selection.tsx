import React from "react";
import { registerUIComponent } from "../engine";
import { defineQuery, getComponentValue, Has, HasValue, runQuery } from "@latticexyz/recs";
import { getAddressColor } from "@latticexyz/std-client";
import { map, merge } from "rxjs";

export function registerSelection() {
  registerUIComponent(
    "SelectedCoords",
    {
      rowStart: 11,
      rowEnd: 13,
      colStart: 1,
      colEnd: 6,
    },
    (layers) => {
      const {
        local: {
          components: { Selection, Selected, Name },
          singletonEntity,
        },
        network: {
          world,
          components: { OwnedBy, Inventory },
        },
      } = layers;

      const dataQuery = defineQuery([Has(Selected)]);

      return merge(dataQuery.update$, Selection.update$, OwnedBy.update$).pipe(
        map(() => {
          const selection = getComponentValue(Selection, singletonEntity);
          const selectedEntity = [...dataQuery.matching][0];
          const ownedBy = getComponentValue(OwnedBy, selectedEntity)?.value;
          const name = getComponentValue(Name, selectedEntity)?.value;

          const inventoryIndex = [
            ...runQuery([Has(Inventory), HasValue(OwnedBy, { value: world.entities[selectedEntity] })]),
          ][0];
          const hasInventory = inventoryIndex != null;

          const inventoryItemNames = [] as string[];
          if (hasInventory) {
            const inventoryItems = [...runQuery([HasValue(OwnedBy, { value: world.entities[inventoryIndex] })])];
            inventoryItems.forEach((itemIndex) => {
              const name = getComponentValue(Name, itemIndex)?.value;
              if (name) inventoryItemNames.push(name);
            });
          }

          return {
            selection,
            ownedBy,
            name,
            hasInventory,
            inventoryItemNames,
          };
        })
      );
    },
    ({ selection, ownedBy, name, hasInventory, inventoryItemNames }) => {
      return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", border: "1px grey solid", width: "100%" }}>
          <div>
            <h2>{name}</h2>
            x: {selection?.x}
            <br />
            y: {selection?.y}
            <br />
            {ownedBy && <p style={{ color: getAddressColor(ownedBy).toString(16) }}>{`owned by: ${ownedBy}`}</p>}
          </div>

          {hasInventory && (
            <div>
              <h2>Inventory</h2>
              <ul>
                {inventoryItemNames.map((itemName) => {
                  return <li>{itemName}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }
  );
}
