import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createInputSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        input,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  const clickSub = input.click$.subscribe((pointer) => {
    const tilePos = pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY }, tileWidth, tileHeight);
    network.api.move(tilePos);
  });

  world.registerDisposer(() => clickSub?.unsubscribe());
}
