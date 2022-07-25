import React, { useEffect, useState } from "react";
import { Layers } from "./types";
import { LayerContext, EngineContext } from "./context";
import { EngineStore } from "./store";
import { MainWindow } from "./components";
import { observer } from "mobx-react-lite";

export const Engine: React.FC<{ layers: Layers; mountReact: { current: (mount: boolean) => void } }> = observer(
  ({ layers, mountReact }) => {
    const [mounted, setMounted] = useState(true);
    useEffect(() => {
      mountReact.current = (mounted: boolean) => setMounted(mounted);
    }, []);

    return mounted ? (
      <LayerContext.Provider value={layers}>
        <EngineContext.Provider value={EngineStore}>
          <MainWindow />
        </EngineContext.Provider>
      </LayerContext.Provider>
    ) : null;
  }
);
