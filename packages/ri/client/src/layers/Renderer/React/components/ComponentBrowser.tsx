import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";
import { Component, Entity, hasComponent } from "@latticexyz/recs";

export function registerComponentBrowser() {
  registerUIComponent(
    "ComponentBrowser",
    (layers) => {
      return {
        layers,
        devHighlightComponent: layers.phaser.components.DevHighlight,
        world: layers.network.world,
      };
    },
    ({ world, layers, devHighlightComponent }) => {
      const allComponents: Component[] = Object.values(layers)
        .map((l) => Object.values(l.components))
        .flat();

      const entitiesWithComponents = [...world.entityToIndex.values()].map(
        (e) => [e, new Set(allComponents.filter((c) => hasComponent(c, e)))] as [Entity, Set<Component>]
      );

      return (
        <Browser
          world={world}
          entities={entitiesWithComponents}
          layers={layers}
          devHighlightComponent={devHighlightComponent}
          setContractComponentValue={layers.network.api.setContractComponentValue}
        />
      );
    }
  );
}
