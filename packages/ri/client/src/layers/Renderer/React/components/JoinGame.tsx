import React from "react";
import { registerUIComponent } from "../engine";
import { getPersonaColor, getPlayerEntity } from "@latticexyz/std-client";
import { getComponentValue } from "@latticexyz/recs";
import { BigNumber } from "ethers";

export function registerJoinGame() {
  registerUIComponent(
    "JoinGameWindow",
    {
      colStart: 3,
      colEnd: 4,
      rowStart: 1,
      rowEnd: 1,
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
      const playerEntity = personaId ? getPlayerEntity(Persona, personaId) : undefined;
      const selection = getComponentValue(Selection, singletonEntity);

      return {
        joinGame,
        personaId,
        playerEntity,
        selection,
      };
    },
    ({ joinGame, personaId, playerEntity, selection }) => {
      const joined = !!playerEntity;
      const playerColor = getPersonaColor(BigNumber.from(personaId).toHexString());

      return (
        <div>
          <h1>Join Game</h1>
          <p style={{ color: playerColor.toString(16) }} >PersonaId: {personaId}</p>
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
