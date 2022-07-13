import React from "react";
import { registerUIComponent } from "../engine";
import { defineQuery, getComponentValue, getComponentValueStrict, Has, HasValue, ProxyExpand, runQuery } from "@latticexyz/recs";
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

          const inventoryResults = [...runQuery([ProxyExpand(OwnedBy, 1), Has(Inventory)], new Set([selectedEntity]))];
          const inventoryIndex = inventoryResults[0];

          const hasInventory = inventoryIndex != null;

          const inventoryItemNames: string[] = [];
          let inventorySize = 0;
          if (hasInventory) {
            inventorySize = getComponentValueStrict(Inventory, inventoryIndex).value;

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
            inventorySize,
          };
        })
      );
    },
    ({ selection, ownedBy, name, hasInventory, inventoryItemNames, inventorySize }) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            border: "1px grey solid",
            width: "100%",
          }}
        >
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
              <h3>
                {inventoryItemNames.length} / {inventorySize}
              </h3>
              <ul>
                {inventoryItemNames.map((itemName, i) => {
                  return <li key={`${itemName}-${i}`}>{itemName}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }
  );
}
