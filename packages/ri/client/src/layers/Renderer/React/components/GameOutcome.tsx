import React from "react";
import { registerUIComponent } from "../engine";
import { getAddressColor } from "@latticexyz/std-client";
import { defineQuery, EntityID, getComponentValue, getComponentValueStrict, Has, HasValue, runQuery } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";

export function registerGameOutcome() {
  registerUIComponent(
    "GameOutcomeWindow",
    {
      colStart: 6,
      colEnd: 6,
      rowStart: 6,
      rowEnd: 6,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Winner, OwnedBy },
          world,
        },
      } = layers;

      return merge(computedToStream(connectedAddress), Winner.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const playerEntity = world.entityToIndex.get(address as EntityID);
          
          const winnerInventory = [...runQuery([Has(Winner)])][0];
          const owner = getComponentValue(OwnedBy, winnerInventory);

          return {
            playerEntity, owner, world
          };
        })
      );
    },
    ({ playerEntity, owner, world }) => {
      let youWin = false;
      if(owner) {
        if(playerEntity && owner.value == world.entities[playerEntity]) {
          youWin = true;
        }
        return (
          <div>
            <h1>{ youWin ? "You Win" : "You Lose" }</h1>
          </div>
        );
      }
      return ( <div></div> );
    }
  );
}
