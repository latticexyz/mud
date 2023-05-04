import { defineComponentSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../createPhaserLayer";
import { Animations, Sprites } from "../constants";

const exclamations = [
  "Wow!",
  "Amazing!",
  "Incredible!",
  "Cool!",
  "Awesome!",
  "Great!",
  "Nice!",
  "Sweet!",
  "Fantastic!",
  "Super!",
  "Radical!",
  "Excellent!",
  "Outstanding!",
  "Marvelous!",
  "Terrific!",
  "Wonderful!",
  "Stupendous!",
  "Astonishing!",
  "Unbelievable!",
  "Unreal!",
  "Unrealistic!",
];

const pleadingForHelp = [
  "quit it",
  "stop",
  "no",
  "please i have a family",
  "i'm begging you",
  "is this a game to you?",
  "i'm not a toy",
  "i'm a person",
  "i have feelings",
  "i'm not a robot",
  "i'm not a machine",
  "i'm not a computer",
  "go do something else",
  "go outside",
  "go for a walk",
  "touch grass",
  "go to the gym",
  "literally do anything else",
  "🤮",
];

export function createSoldierSystem(layer: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { phaserScene, config },
    },
    networkLayer: {
      components: { CounterTable },
      worldSend,
    },
  } = layer;
  const soliderSprite = config.sprites[Sprites.Soldier];
  const particles = phaserScene.add.particles(soliderSprite.assetKey);

  const soldier = phaserScene.add
    .sprite(0, 0, "soldier")
    .play(Animations.SwordsmanIdle)
    .setPosition(0, 0)
    .setInteractive()
    .setOrigin(0.5, 0.5);

  let tween: Phaser.Tweens.Tween | undefined;
  const emitter = particles.createEmitter({
    x: soldier.x,
    y: soldier.y,
    speed: { min: -400, max: 400 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.5, end: 0 },
    blendMode: "SCREEN",
    lifespan: 600,
    gravityY: 800,
    quantity: 20,
  });

  soldier.on("pointerdown", async () => {
    if (tween) return;

    await worldSend("increment", []);

    tween = phaserScene.add.tween({
      targets: soldier,
      duration: 250,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  });

  // Every time the counter changes, update the soldier
  defineComponentSystem(world, CounterTable, ({ value }) => {
    const [currentValue] = value;
    tween?.stop();
    tween = undefined;

    soldier.setAlpha(1);

    const level = currentValue?.value ?? 0;

    soldier.setScale(1 + level * 0.3);
    emitter.explode(level * 4);

    const textArray = level > 100 ? pleadingForHelp : exclamations;
    const text = textArray[Math.floor(Math.random() * textArray.length)];

    const exclamation = phaserScene.add
      .text(soldier.x, soldier.y, text, {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1000);

    phaserScene.add.tween({
      targets: exclamation,
      duration: 1000,
      y: exclamation.y - 100,
      alpha: 0,
      onComplete: () => {
        exclamation.destroy();
      },
    });
  });
}
