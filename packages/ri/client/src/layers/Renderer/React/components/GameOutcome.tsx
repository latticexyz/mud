import React from "react";
import { registerUIComponent } from "../engine";
import { EntityID, getComponentValue, Has, runQuery } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";

export function registerGameOutcome() {
  registerUIComponent(
    "GameOutcomeWindow",
    {
      colStart: 6,
      colEnd: 6,
      rowStart: 12,
      rowEnd: 12,
    },
    (layers) => {
      const {
        network: {
          network: { connectedAddress },
          components: { Winner, OwnedBy, Death },
          world,
        },
      } = layers;

      return merge(computedToStream(connectedAddress), Winner.update$, Death.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const playerEntity = world.entityToIndex.get(address as EntityID);
          
          const winnerInventory = [...runQuery([Has(Winner)])][0];
          const owner = getComponentValue(OwnedBy, winnerInventory);

          let playerDead = false;
          if( playerEntity ) {
            playerDead = getComponentValue(Death, playerEntity) ? true : false;
          }

          return {
            playerEntity, owner, world, playerDead
          };
        })
      );
    },
    ({ playerEntity, owner, world, playerDead }) => {
      let outcome = "";
      
      if(owner) {
        if(playerEntity && owner.value == world.entities[playerEntity]) {
          outcome = "You Win";
        }
        else {
          outcome = "You Lose";
        }
      }
      else if( playerDead ){
        outcome = "You Died";
      }
      
      return (
        <div>
          <h1>{ outcome }</h1>
        </div>
      );    
    }
  );
}
