import React from "react";
import { registerUIComponent } from "../engine";
import { getPersonaColor } from "@latticexyz/std-client";
import { defineQuery, getComponentValueStrict, HasValue } from "@latticexyz/recs";
import { BigNumber, ethers } from "ethers";
import { map, merge } from "rxjs";

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
          personaId,
          components: { Persona },
        },
        local: {
          singletonEntity,
          components: { Selection },
        },
      } = layers;
      const playerEntityQuery = defineQuery([
        HasValue(Persona, { value: ethers.BigNumber.from(personaId).toHexString() }),
      ], { runOnInit: true });

      return merge(playerEntityQuery.update$, Selection.update$).pipe(
        map(() => {
          const selection = getComponentValueStrict(Selection, singletonEntity);
          return {
            joinGame,
            personaId,
            playerEntity: [...playerEntityQuery.matching][0],
            selection,
          };
        })
      );
    },
    ({ joinGame, personaId, playerEntity, selection }) => {
      const joined = !!playerEntity;
      const playerColor = getPersonaColor(BigNumber.from(personaId).toHexString());

      return (
        <div>
          {!joined && <h1>Join Game</h1>}
          <p style={{ color: playerColor.toString(16) }}>PersonaId: {personaId}</p>
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
