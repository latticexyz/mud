import React from "react";
import { registerUIComponent } from "../engine";
import {
  defineQuery,
  EntityID,
  getComponentValue,
  Has,
  UpdateType,
} from "@latticexyz/recs";
import { map, merge } from "rxjs";

export function registerFactoryView() {
  registerUIComponent(
    "Factory",
    {
      rowStart: 11,
      rowEnd: 13,
      colStart: 7,
      colEnd: 10,
    },
    (layers) => {
      const {
        local: {
          components: { Selected, Name },
        },
        network: {
          world,
          components: { Factory },
        },
      } = layers;

      return merge(defineQuery([Has(Selected), Has(Factory)]).update$).pipe(
        map(({ entity, type }) => {
          let factory = getComponentValue(Factory, entity);
          if(UpdateType.Exit === type) factory = undefined;

          return { Name, world, factory };
        })
      );
    },
    ({ Name, factory, world }) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            border: "1px grey solid",
            width: "100%",
          }}
        >
          {factory && (
            <div>
              <h1>Build Options</h1>
              <ol>
                {factory.prototypeIds.map((prototypeId, i) => {
                  const prototype = world.entityToIndex.get(prototypeId as EntityID);
                  if(prototype == null) return null;

                  const name = getComponentValue(Name, prototype);
                  return <li key={`${prototypeId}-${i}`}>{name?.value}: {factory.costs[i]} Gold</li>;
                })}
              </ol>
            </div>
          )}
        </div>
      );
    }
  );
}
