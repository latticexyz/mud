import { PhaserLayer } from "../createPhaserLayer";
import { createCamera } from "./createCamera";
import { createMapSystem } from "./createMapSystem";
import { createPlayersSystem } from "./createPlayersSystem";

export const registerSystems = (layer: PhaserLayer) => {
  createCamera(layer);
  createMapSystem(layer);
  createPlayersSystem(layer);
};
