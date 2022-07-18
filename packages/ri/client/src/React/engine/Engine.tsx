import React from "react";
import { LayerContext, EngineContext } from "./context";
import { EngineStore } from "./store";
import { MainWindow } from "./components";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useState } from "react";
import { Game } from "../../types";

export const Engine: React.FC<{ game: Game; mountReact: { current: (mount: boolean) => void } }> = observer(
  ({ game, mountReact }) => {
    const [mounted, setMounted] = useState(true);
    useEffect(() => {
      mountReact.current = (mounted: boolean) => setMounted(mounted);
    }, []);

    return mounted ? (
      <LayerContext.Provider value={game}>
        <EngineContext.Provider value={EngineStore}>
          <MainWindow />
        </EngineContext.Provider>
      </LayerContext.Provider>
    ) : null;
  }
);
