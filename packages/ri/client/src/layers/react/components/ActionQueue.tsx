import React from "react";
import { registerUIComponent } from "../engine";
import { getComponentEntities, getComponentValueStrict } from "@latticexyz/recs";
import { map } from "rxjs";
import { ActionStateString, ActionState } from "@latticexyz/std-client";

export function registerActionQueue() {
  registerUIComponent(
    "ActionQueue",
    {
      rowStart: 4,
      rowEnd: 12,
      colStart: 1,
      colEnd: 3,
    },
    (layers) => {
      const {
        network: {
          actions: { Action },
        },
      } = layers;

      return Action.update$.pipe(
        map(() => ({
          Action,
        }))
      );
    },
    ({ Action }) => {
      return (
        <div>
          <p>Actions:</p>
          {[...getComponentEntities(Action)].map((e) => {
            const actionData = getComponentValueStrict(Action, e);
            const state = ActionStateString[actionData.state as ActionState];
            return (
              <p key={`action${e}`}>
                {Action.world.entities[e]}: {state}
              </p>
            );
          })}
        </div>
      );
    }
  );
}
