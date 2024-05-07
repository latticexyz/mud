import { defineSystem, getComponentValueStrict, Has } from "@latticexyz/recs";
import { PhaserLayer } from "../createPhaserLayer";
import { pixelToWorldCoord, worldCoordToPixel, entityToShortAddress } from "../utils";
import { Direction } from "../../../types";
import { Animations } from "../constants";

export function createPlayersSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: {
        phaserScene,
        input,
        maps: { Main },
      },
    },
    networkLayer: {
      network: { playerEntity },
      components: { Player, Position },
      systemCalls: { move, spawn },
    },
  } = layer;

  // spawn handling
  input.click$.subscribe((pointer) => {
    const clickedPosition = pixelToWorldCoord(Main, {
      x: pointer.worldX,
      y: pointer.worldY,
    });

    spawn(clickedPosition.x, clickedPosition.y);
  });

  // map of entities to gameobject containers
  const containers = new Map<string, Phaser.GameObjects.Container>();

  // movement handling
  input.onKeyPress(
    (keys) => keys.has("UP") || keys.has("W"),
    () => {
      move(Direction.North);
    },
  );

  input.onKeyPress(
    (keys) => keys.has("DOWN") || keys.has("S"),
    () => {
      move(Direction.South);
    },
  );

  input.onKeyPress(
    (keys) => keys.has("LEFT") || keys.has("A"),
    () => {
      move(Direction.West);
    },
  );

  input.onKeyPress(
    (keys) => keys.has("RIGHT") || keys.has("D"),
    () => {
      move(Direction.East);
    },
  );

  // system to handle players positions updates
  defineSystem(world, [Has(Player), Has(Position)], (update) => {
    const { entity } = update;

    const position = getComponentValueStrict(Position, entity);
    console.log("new player position:", entity, "x:", position.x, "y:", position.y);

    const pixelCoord = worldCoordToPixel(Main, position);

    let container = containers.get(entity);

    if (!container) {
      container = phaserScene.add.container(0, 0);

      const sprite = phaserScene.add.sprite(0, 0, "soldier").play(Animations.SwordsmanIdle).setOrigin(0, 0);

      let label = entityToShortAddress(entity);
      if (playerEntity === entity) {
        label = `${label} (you)`;
      }
      const text = phaserScene.add.text(-45, -20, label);

      container.add(sprite);
      container.add(text);

      containers.set(entity, container);
    }

    container.setPosition(pixelCoord.x, pixelCoord.y);
  });
}
