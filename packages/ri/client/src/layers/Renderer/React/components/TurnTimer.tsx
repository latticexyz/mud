import React from "react";
import { registerUIComponent } from "../engine";
import { getAddressColor, getGameConfig } from "@latticexyz/std-client";
import "./TurnTimer.css";
import { map } from "rxjs";

export function registerTurnTimer() {
  registerUIComponent(
    "TurnTimer",
    {
      rowStart: 1,
      rowEnd: 3,
      colStart: 1,
      colEnd: 3,
    },
    (layers) => {
      const {
        world,
        network: { clock, connectedAddress },
        components: { GameConfig },
      } = layers.network;

      return clock.time$.pipe(
        map((time) => {
          const gameConfig = getGameConfig(world, GameConfig);
          if (!gameConfig) return { secondsUntilNextTurn: 0 };

          const gameStartTime = parseInt(gameConfig.startTime);
          const turnLength = parseInt(gameConfig.turnLength);

          const currentTime = time / 1000;
          const timeElapsed = currentTime - gameStartTime;
          const secondsUntilNextTurn = turnLength - (timeElapsed % turnLength);

          const address = connectedAddress.get();

          return {
            secondsUntilNextTurn,
            turnLength,
            address
          };
        })
      );
    },
    ({ secondsUntilNextTurn, turnLength, address }) => {
      if (!turnLength) return null;

      const color = getAddressColor(address ?? "");

      return (
        <div>
          <h2>Turn Timer</h2>
          <div
            style={{
              height: "36px",
              border: "3px black solid",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              width: `calc(${200 / turnLength}px + 6px)`,
            }}
          >
            <div
              style={{
                transition: "width 1s linear",
                backgroundColor: color.toString(16),
                height: "100%",
                width: `calc(${(secondsUntilNextTurn / turnLength) * 200}px)`,
              }}
            ></div>
          </div>
        </div>
      );
    }
  );
}
