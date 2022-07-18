import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";
import { from } from "rxjs";
import { defineComponent, Type } from "@latticexyz/recs";

export function registerComponentBrowser() {
  registerUIComponent(
    "ComponentBrowser",
    {
      colStart: 10,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (game) => {
      return from([
        {
          game,
          devHighlightComponent: defineComponent(game.current.world, { value: Type.OptionalNumber }),
          hoverHighlightComponent: defineComponent(game.current.world, {
            x: Type.OptionalNumber,
            y: Type.OptionalNumber,
          }),
          world: game.current.world,
        },
      ]);
    },
    ({ game, world, devHighlightComponent, hoverHighlightComponent }) => {
      return (
        <Browser
          world={world}
          entities={world.entities}
          layers={game}
          devHighlightComponent={devHighlightComponent}
          hoverHighlightComponent={hoverHighlightComponent}
          setContractComponentValue={() => void 0}
        />
      );
    }
  );
}
