import React from "react";
import { registerUIComponent } from "../engine";
import { defineQuery, HasValue } from "@latticexyz/recs";
import { map } from "rxjs";

export function registerInventory() {
  registerUIComponent(
    "Inventory",
    {
      rowStart: 4,
      rowEnd: 12,
      colStart: 1,
      colEnd: 3,
    },
    (layers) => {
      const {
        network: {
          world,
          components: { CarriedBy },
          network: { connectedAddress },
        },
      } = layers;

      const query = defineQuery([HasValue(CarriedBy, { value: connectedAddress.get() })]);

      return query.update$.pipe(map(() => ({ matching: query.matching, world })));
    },
    ({ matching, world }) => {
      return (
        <div>
          <p>Backpack:</p>
          {[...matching].map((e) => {
            return <p key={`action${e}`}>{world.entities[e]}</p>;
          })}
        </div>
      );
    }
  );
}
