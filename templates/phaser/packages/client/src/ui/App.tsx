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
    <div>
      <PhaserLayer networkLayer={networkLayer} />

      <UIRoot />
    </div>
  );
};
