import React from "react";
import { observer } from "mobx-react-lite";
import { useLayers, useEngineStore } from "../hooks";
import { filterNullishValues } from "@mud/utils";
import { Entity } from "@mud/recs";

export const ComponentRenderer: React.FC<{
  selectedEntities: Set<Entity>;
}> = observer(({ selectedEntities }) => {
  const { UIComponents } = useEngineStore();
  const layers = useLayers();
  return (
    <>
      {filterNullishValues(
        // Iterate through all registered UIComponents
        // and return those whose requirements are fulfilled
        [...UIComponents.entries()].map(([key, UIComponent]) => {
          const data = UIComponent.requirement(layers, selectedEntities);
          if (data) return <div key={`component-${key}`}>{UIComponent.render(data)}</div>;
        })
      )}
    </>
  );
});
