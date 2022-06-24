import React from "react";
import styled from "styled-components";
import { Layers } from "./types";
import { LayerContext, EngineContext } from "./context";
import { EngineStore } from "./store";
import { MainWindow } from "./components";
import { observer } from "mobx-react-lite";

export const Engine: React.FC<{ layers: Layers }> = observer(({ layers }) => {
  return (
    <LayerContext.Provider value={layers}>
      <EngineContext.Provider value={EngineStore}>
        <MainWindow />
      </EngineContext.Provider>
    </LayerContext.Provider>
  );
});
