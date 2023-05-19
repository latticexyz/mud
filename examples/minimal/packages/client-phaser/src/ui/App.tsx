import { useEffect } from "react";
import { useNetworkLayer } from "./hooks/useNetworkLayer";
import { useStore } from "../store";
import { PhaserLayer } from "./PhaserLayer";
import { UIRoot } from "./UIRoot";

export const App = () => {
  const networkLayer = useNetworkLayer();

  useEffect(() => {
    if (networkLayer) {
      useStore.setState({ networkLayer });
    }
  }, [networkLayer]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <PhaserLayer networkLayer={networkLayer} />

      <UIRoot />
    </div>
  );
};
