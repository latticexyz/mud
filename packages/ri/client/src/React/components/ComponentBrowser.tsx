import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";
import { of } from "rxjs";
export function registerComponentBrowser() {
  registerUIComponent(
    "ComponentBrowser",
    {
      colStart: 10,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (game) => of(game),
    (game) => {
      return (
        <Browser
          world={game.main.world}
          entities={game.main.world.entities}
          layers={game}
          devHighlightComponent={game.main.dev.DevHighlightComponent}
          hoverHighlightComponent={game.main.dev.HoverHighlightComponent}
          setContractComponentValue={game.main.dev.setContractComponentValue}
        />
      );
    }
  );
}
