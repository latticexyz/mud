import React from "react";
import { observer } from "mobx-react-lite";
import { useLayers, useEngineStore } from "../hooks";
import { filterNullishValues } from "@latticexyz/utils";
import { Cell } from "./Cell";
import styled from "styled-components";
import { GridConfiguration, Layers, UIComponent } from "../types";
import { useStream } from "@latticexyz/std-client";

const UIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 8.33%);
  grid-template-rows: repeat(12, 8.33%);
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

export function renderUIComponent(layers: Layers, key: string, { requirement, render, gridConfig }: UIComponent) {
  const state = useStream(requirement(layers));
  if (!state) return null;

  return (
    <UIComponentContainer key={`component-${key}`} gridConfig={gridConfig}>
      {render(state)};
    </UIComponentContainer>
  );
}

export const ComponentRenderer: React.FC = observer(() => {
  const { UIComponents } = useEngineStore();
  const layers = useLayers();

  return (
    <UIGrid>
      {filterNullishValues(
        // Iterate through all registered UIComponents
        // and return those whose requirements are fulfilled
        [...UIComponents.entries()].map(([key, UIComponent]) => {
          return renderUIComponent(layers, key, UIComponent);
        })
      )}
    </UIGrid>
  );
});
