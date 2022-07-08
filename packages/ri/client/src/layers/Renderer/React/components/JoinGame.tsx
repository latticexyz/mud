import React from "react";
import { registerUIComponent } from "../engine";
import { getAddressColor } from "@latticexyz/std-client";
import { defineQuery, EntityID, getComponentValueStrict, HasValue } from "@latticexyz/recs";
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
          singletonEntity,
          components: { Selection },
        },
      } = layers;

      return merge(computedToStream(connectedAddress), Selection.update$, Player.update$).pipe(
        map(() => connectedAddress.get()),
        map((address) => {
          const playerEntity = world.entityToIndex.get(address as EntityID);
          const selection = getComponentValueStrict(Selection, singletonEntity);
          return {
            joinGame,
            selection,
            playerEntity,
            address,
          };
        })
      );
    },
    ({ joinGame, playerEntity, selection, address }) => {
      const joined = playerEntity != undefined;
      const playerColor = getAddressColor(address || "");

      return (
        <div>
          {!joined && <h1>Join Game</h1>}
          <p style={{ color: playerColor.toString(16) }}>Address: {address}</p>
          <p>Joined? {joined ? "yes" : "no"}</p>
          {!joined && (
            <button
              disabled={!selection}
              onClick={() => {
                if (!selection) return;
                joinGame({ x: selection.x, y: selection.y });
              }}
            >
              Join at Position ({selection?.x},{selection?.y})
            </button>
          )}
        </div>
      );
    }
  );
}
