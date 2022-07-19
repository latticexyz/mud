import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { defineComponentSystem } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { Sprites } from "../constants";
import { PhaserLayer } from "../types";

export function createPositionSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { Position },
  } = network;

  const {
    scenes: {
      Main: {
        objectPool,
        config,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  defineComponentSystem(world, Position, (update) => {
    const position = update.value[0];
    if (!position) return console.warn("no position");

    const object = objectPool.get(update.entity, "Sprite");
    const { x, y } = tileCoordToPixelCoord(position, tileWidth, tileHeight);
    const sprite = config.sprites[Sprites.Donkey];

    object.setComponent({
      id: Position.id,
      once: (gameObject) => {
        gameObject.setTexture(sprite.assetKey, sprite.frame);
        gameObject.setPosition(x, y);
      },
    });
  });
}
