import React from "react";
import { registerUIComponent } from "../engine";
import { getCurrentTurn, getGameConfig } from "@latticexyz/std-client";
import { BigNumber } from "ethers";

export function registerTurnTimer() {
  registerUIComponent(
    "TurnTimer",
    (layers) => {
      const {
        world,
        network: {
          clock
        },
        components: {
          GameConfig
        }
      } = layers.network;
      const gameConfig = getGameConfig(world, GameConfig);
      if(!gameConfig) return;

      const gameStartTime = parseInt(gameConfig.startTime);
      const turnLength = parseInt(gameConfig.turnLength);
      const currentTime = clock.currentTime / 1000;
      const timeElapsed = currentTime - gameStartTime;
      const secondsUntilNextTurn = turnLength - timeElapsed % turnLength;

      return {
        currentTurn: getCurrentTurn(world, GameConfig, BigNumber.from(currentTime)),
        secondsUntilNextTurn
      };
    },
    ({ currentTurn, secondsUntilNextTurn }) => {

      return (
        <h1>{currentTurn}: {secondsUntilNextTurn}</h1>
      );
    }
  );
}
