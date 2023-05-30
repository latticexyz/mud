import { PhaserLayer } from "../createPhaserLayer";

export const createCamera = (layer: PhaserLayer) => {
  const {
    scenes: {
      Main: {
        camera: { phaserCamera },
      },
    },
  } = layer;

  phaserCamera.centerOn(0, 0);
};
