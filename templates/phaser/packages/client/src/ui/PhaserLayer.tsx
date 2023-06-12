import React, { useEffect } from "react";
import { NetworkLayer } from "../layers/network/createNetworkLayer";
import { useStore } from "../store";
import { usePhaserLayer } from "./hooks/usePhaserLayer";

type Props = {
  networkLayer: NetworkLayer | null;
};

export const PhaserLayer = ({ networkLayer }: Props) => {
  const { ref: phaserRef, phaserLayer } = usePhaserLayer({ networkLayer });

  useEffect(() => {
    if (phaserLayer) {
      useStore.setState({ phaserLayer });
    }
  }, [phaserLayer]);

  return <div ref={phaserRef} />;
};
