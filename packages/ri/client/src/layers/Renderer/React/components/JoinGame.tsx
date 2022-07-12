import React from "react";
import { registerUIComponent } from "../engine";
import { getAddressColor } from "@latticexyz/std-client";
import { defineQuery, EntityID, getComponentValue, getComponentValueStrict, Has, HasValue, runQuery } from "@latticexyz/recs";
import { map, merge } from "rxjs";
import { computedToStream } from "@latticexyz/utils";

export function registerJoinGame() {
  registerUIComponent(
    "JoinGameWindow",
    {
      colStart: 6,
      colEnd: 7,
      rowStart: 1,
      rowEnd: 3,
    },
    (layers) => {
      const {
        headless: {
          api: { joinGame },
        },
        network: {
          network: { connectedAddress },
          components: { Player },
          world,
        },
        local: {
          components: { Selected, LocalPosition },
        },
      } = layers;

      return merge(computedToStream(connectedAddress), Selected.update$, Player.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const playerEntity = world.entityToIndex.get(address as EntityID);
          
          const selectedEntity = [...runQuery([Has(Selected)])][0];
          const position = getComponentValue(LocalPosition, selectedEntity);

          return {
            joinGame,
            selectedEntity,
            position,
            playerEntity,
            address,
          };
        })
      );
    },
    ({ joinGame, playerEntity, selectedEntity, position, address }) => {
      const joined = playerEntity != undefined;
      const playerColor = getAddressColor(address || "");

      return (
        <div>
          {!joined && <h1>Join Game</h1>}
          <p style={{ color: playerColor.toString(16) }}>Address: {address}</p>
          <p>Joined? {joined ? "yes" : "no"}</p>
          {!joined && selectedEntity != null && (
            <button
              onClick={() => {
                joinGame(selectedEntity);
              }}
            >
              Join at Position ({position?.x},{position?.y})
            </button>
          )}
        </div>
      );
    }
  );
}
