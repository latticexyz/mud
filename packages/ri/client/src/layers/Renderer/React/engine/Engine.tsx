import React from "react";
import styled from "styled-components";
import { Layers } from "./types";
import { LayerContext, EngineContext } from "./context";
import { EngineStore } from "./store";
import { MainWindow, PreviewWindow } from "./components";
import { observer } from "mobx-react-lite";

export const Engine: React.FC<{ layers: Layers }> = observer(({ layers }) => {
  return (
    <LayerContext.Provider value={layers}>
      <EngineContext.Provider value={EngineStore}>
        <Container>
          <MainWindow />
          <PreviewWindow />
        </Container>
      </EngineContext.Provider>
    </LayerContext.Provider>
  );
});

const Container = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  pointer-events: none;
  display: grid;
  justify-content: start;
  align-items: start;
  grid-auto-flow: column;
`;
