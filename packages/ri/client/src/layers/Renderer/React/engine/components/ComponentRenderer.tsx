import React, { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { useLayers, useEngineStore } from "../hooks";
import { filterNullishValues } from "@latticexyz/utils";
import { Cell } from "./Cell";
import styled from "styled-components";
import { GridConfiguration } from "../types";
import { Observable } from "rxjs";
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

export function renderUIComponent<T>({
  requirementStream,
  render,
}: {
  requirementStream: Observable<T>;
  render(props: T): ReactElement | null;
}) {
  const state = useStream(requirementStream);
  if(!state) return null;
  
  return render(state);
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
          const requirementStream = UIComponent.requirement(layers);
          return (
            <UIComponentContainer key={`component-${key}`} gridConfig={UIComponent.gridConfig}>
              {renderUIComponent({ requirementStream, render: UIComponent.render })}
            </UIComponentContainer>
          );
        })
      )}
    </UIGrid>
  );
});
