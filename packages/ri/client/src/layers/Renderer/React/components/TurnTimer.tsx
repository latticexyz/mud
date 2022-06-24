import React from "react";
import { registerUIComponent } from "../engine";
import { getGameConfig } from "@latticexyz/std-client";
import "./TurnTimer.css";

function calculateTimeFraction(timeLeft: number) {
  const rawTimeFraction = timeLeft / 20;
  return rawTimeFraction - (1 / 20) * (1 - rawTimeFraction);
}

const FULL_DASH_ARRAY = 283;
function calculateCircleDashArray(timeLeft: number) {
  return `${(calculateTimeFraction(timeLeft) * FULL_DASH_ARRAY).toFixed(0)} 283`;
}

function remainingPathColor(timeLeft: number) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    return alert.color;
  } else if (timeLeft <= warning.threshold) {
    return warning.color;
  }

  return info.color;
}

const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

const TurnCountdown: React.FC<{ secondsLeft: number }> = ({ secondsLeft }) => {
  return (
    <div className="base-timer">
      <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g className="base-timer__circle">
          <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            strokeDasharray={calculateCircleDashArray(secondsLeft)}
            className={`base-timer__path-remaining ${remainingPathColor(secondsLeft)}`}
            d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" className="base-timer__label">
        {secondsLeft}
      </span>
    </div>
  );
};

export function registerTurnTimer() {
  registerUIComponent(
    "TurnTimer",
    {
      rowStart: 1,
      rowEnd: 1,
      colStart: 1,
      colEnd: 1,
    },
    (layers) => {
      const {
        world,
        network: { clock },
        components: { GameConfig },
      } = layers.network;
      const gameConfig = getGameConfig(world, GameConfig);
      if (!gameConfig) return;

      const gameStartTime = parseInt(gameConfig.startTime);
      const turnLength = parseInt(gameConfig.turnLength);
      const currentTime = clock.currentTime / 1000;
      const timeElapsed = currentTime - gameStartTime;
      const secondsUntilNextTurn = turnLength - (timeElapsed % turnLength);

      return {
        secondsUntilNextTurn,
      };
    },
    ({ secondsUntilNextTurn }) => {
      return <TurnCountdown secondsLeft={secondsUntilNextTurn} />;
    }
  );
}
