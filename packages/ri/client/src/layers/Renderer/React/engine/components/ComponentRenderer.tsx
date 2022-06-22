import React from "react";
import { observer } from "mobx-react-lite";
import { useLayers, useEngineStore } from "../hooks";
import { filterNullishValues } from "@latticexyz/utils";
import { Component, Entity } from "@latticexyz/recs";
import { useState } from "react";
import { useEffect } from "react";
import { merge, throttleTime } from "rxjs";

export const ComponentRenderer: React.FC<{
  selectedEntities: Set<Entity>;
}> = observer(({ selectedEntities }) => {
  const { UIComponents } = useEngineStore();
  const layers = useLayers();

  // TODO: remove this hack and create a useQuery hook instead that makes an individual React component rerender
  const [, setState] = useState(0);
  useEffect(() => {
    const components: Component[] = Object.values(layers)
      .map((layer) => Object.values(layer.components))
      .flat();

    const subscription = merge(...components.map((c) => c.update$))
      .pipe(throttleTime(1000))
      .subscribe(() => setState((i) => i + 1));
    return () => subscription?.unsubscribe();
  });
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
