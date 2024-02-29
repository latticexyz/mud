import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useResizeObserver, { ResizeHandler } from "use-resize-observer";
import { throttle } from "lodash";
import { createPhaserLayer } from "../../layers/phaser/createPhaserLayer";
import { NetworkLayer } from "../../layers/network/createNetworkLayer";
import { usePromiseValue } from "./usePromiseValue";
import { phaserConfig } from "../../layers/phaser/configurePhaser";

const createContainer = () => {
  const container = document.createElement("div");
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.pointerEvents = "all";
  container.style.overflow = "hidden";
  return container;
};

type Props = {
  networkLayer: NetworkLayer | null;
};

export const usePhaserLayer = ({ networkLayer }: Props) => {
  const parentRef = useRef<HTMLElement | null>(null);
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  const { phaserLayerPromise, container } = useMemo(() => {
    if (!networkLayer) return { phaserLayerPromise: null, container: null };

    const container = createContainer();
    if (parentRef.current) {
      parentRef.current.appendChild(container);
    }

    return {
      container,
      phaserLayerPromise: createPhaserLayer(networkLayer, {
        ...phaserConfig,
        scale: {
          ...phaserConfig.scale,
          parent: container,
          mode: Phaser.Scale.NONE,
          width,
          height,
        },
      }),
    };

    // We don't want width/height to recreate phaser layer, so we ignore linter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkLayer]);

  useEffect(() => {
    return () => {
      phaserLayerPromise?.then((phaserLayer) => phaserLayer.world.dispose());
      container?.remove();
    };
  }, [container, phaserLayerPromise]);

  const phaserLayer = usePromiseValue(phaserLayerPromise);

  const onResize = useMemo<ResizeHandler>(() => {
    return throttle(({ width, height }) => {
      setSize({ width: width ?? 0, height: height ?? 0 });
    }, 500);
  }, []);

  useResizeObserver({
    ref: container,
    onResize,
  });

  const ref = useCallback(
    (el: HTMLElement | null) => {
      parentRef.current = el;
      if (container) {
        if (parentRef.current) {
          parentRef.current.appendChild(container);
        } else {
          container.remove();
        }
      }
    },
    [container]
  );

  return useMemo(() => ({ ref, phaserLayer }), [ref, phaserLayer]);
};
