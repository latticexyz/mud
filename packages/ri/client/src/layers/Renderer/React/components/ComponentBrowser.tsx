import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";
import { from } from "rxjs";

export function registerComponentBrowser() {
  registerUIComponent(
    "ComponentBrowser",
    {
      colStart: 10,
      colEnd: 13,
      rowStart: 1,
      rowEnd: 13,
    },
    (layers) => {
      return from([{
        layers,
        devHighlightComponent: layers.phaser.components.DevHighlight,
        world: layers.network.world,
      }]);
    },
    ({ layers, world, devHighlightComponent }) => {
      return (
        <Browser
          world={world}
          entities={world.entities}
          layers={layers}
          devHighlightComponent={devHighlightComponent}
          setContractComponentValue={layers.network.api.setContractComponentValue}
        />
      );
    }
  );
}
