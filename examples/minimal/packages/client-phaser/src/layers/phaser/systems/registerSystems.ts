import { PhaserLayer } from "../createPhaserLayer";
import { createCamera } from "./createCamera";
import { createMapSystem } from "./createMapSystem";
import { createSoldierSystem } from "./createSoldierSystem";

export const registerSystems = (layer: PhaserLayer) => {
  createCamera(layer);
  createMapSystem(layer);
  createSoldierSystem(layer);
};
