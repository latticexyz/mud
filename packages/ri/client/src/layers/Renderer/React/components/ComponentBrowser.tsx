import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";

export function registerComponentBrowser() {
  registerUIComponent(
    "ComponentBrowser",
    (layers) => {
      return;
      return {
        entities: layers.phaser.world.entities,
        layers,
        devHighlightComponent: layers.phaser.components.DevHighlight,
      };
    },
    ({ entities, layers, devHighlightComponent }) => {
      return (
        <Browser
          entities={[...entities.entries()]}
          layers={layers}
          devHighlightComponent={devHighlightComponent}
          setContractComponentValue={layers.network.api.setContractComponentValue}
        />
      );
    }
  );
}
