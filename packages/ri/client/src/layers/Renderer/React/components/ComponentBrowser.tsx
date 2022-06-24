import React from "react";
import { Browser } from "@latticexyz/ecs-browser";
import { registerUIComponent } from "../engine";
import { Component, Entity, hasComponent } from "@latticexyz/recs";

export function registerComponentBrowser() {
  // registerUIComponent(
  //   "ComponentBrowser",
  //   (layers) => {
  //     const numEntities = layers.network.world.entities.length;
  //     if (numEntities > 1000) return numEntities;
  //     return {
  //       layers,
  //       devHighlightComponent: layers.phaser.components.DevHighlight,
  //       world: layers.network.world,
  //     };
  //   },
  //   (data) => {
  //     if (typeof data === "number") return <div>Too many entities ({data}) to use component browser</div>;

  //     const { layers, world, devHighlightComponent } = data;

  //     const allComponents: Component[] = Object.values(layers)
  //       .map((l) => Object.values(l.components))
  //       .flat();

  //     const entitiesWithComponents = [...world.entityToIndex.values()].map(
  //       (e) => [e, new Set(allComponents.filter((c) => hasComponent(c, e)))] as [Entity, Set<Component>]
  //     );

  //     return (
  //       <Browser
  //         world={world}
  //         entities={entitiesWithComponents}
  //         layers={layers}
  //         devHighlightComponent={devHighlightComponent}
  //         setContractComponentValue={layers.network.api.setContractComponentValue}
  //       />
  //     );
  //   }
  // );
}
