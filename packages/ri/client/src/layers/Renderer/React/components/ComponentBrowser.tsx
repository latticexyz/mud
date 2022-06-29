import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";
import { Component, EntityIndex, hasComponent } from "@latticexyz/recs";

export function registerComponentBrowser() {
  registerUIComponent(
    "ComponentBrowser",
    {
      colStart: 6,
      colEnd: 7,
      rowStart: 1,
      rowEnd: 5
    },
    (layers) => {
      const numEntities = layers.network.world.entities.length;
      if (numEntities > 1000) return numEntities;
      return {
        layers,
        devHighlightComponent: layers.phaser.components.DevHighlight,
        world: layers.network.world,
      };
    },
    (data) => {
      if(typeof data !== "number" && !data.layers.network.DEV_MODE) return <></>;
      if (typeof data === "number") return <div>Too many entities ({data}) to use component browser</div>;

      const { layers, world, devHighlightComponent } = data;


      const allComponents: Component[] = Object.values(layers)
        .map((l) => Object.values(l.components))
        .flat();

      const entitiesWithComponents = [...world.entityToIndex.values()].map(
        (e) => [e, new Set(allComponents.filter((c) => hasComponent(c, e)))] as [EntityIndex, Set<Component>]
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
