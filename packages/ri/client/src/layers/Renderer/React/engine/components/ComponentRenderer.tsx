import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useLayers, useEngineStore } from "../hooks";
import { filterNullishValues } from "@latticexyz/utils";
import { Component, Entity } from "@latticexyz/recs";
import { merge, throttleTime } from "rxjs";
import { Cell } from "./Cell";
import styled from "styled-components";
import { GridConfiguration } from "../types";

const UIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 16.6%);
  grid-template-rows: repeat(4, 25%);
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  pointer-events: none;
`;

const UIComponentContainer: React.FC<{ gridConfig: GridConfiguration }> = ({ children, gridConfig }) => {
  const { colStart, colEnd, rowStart, rowEnd } = gridConfig;

  return (
    <Cell
      style={{
        gridRowStart: rowStart,
        gridRowEnd: rowEnd,
        gridColumnStart: colStart,
        gridColumnEnd: colEnd,
      }}
    >
      {children}
    </Cell>
  );
};

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
    <UIGrid>
      {filterNullishValues(
        // Iterate through all registered UIComponents
        // and return those whose requirements are fulfilled
        [...UIComponents.entries()].map(([key, UIComponent]) => {
          const data = UIComponent.requirement(layers, selectedEntities);
          if (data)
            return (
              <UIComponentContainer key={`component-${key}`} gridConfig={UIComponent.gridConfig}>
                {UIComponent.render(data)}
              </UIComponentContainer>
            );
        })
      )}
    </UIGrid>
  );
});
