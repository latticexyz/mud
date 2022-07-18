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
          world={game.current.world}
          entities={game.current.world.entities}
          layers={game}
          devHighlightComponent={game.current.dev.DevHighlightComponent}
          hoverHighlightComponent={game.current.dev.HoverHighlightComponent}
          setContractComponentValue={game.current.dev.setContractComponentValue}
        />
      );
    }
  );
}
