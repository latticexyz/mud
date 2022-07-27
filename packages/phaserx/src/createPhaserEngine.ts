import { defineScene } from "./defineScene";
import { definePhaserConfig } from "./definePhaserConfig";
import { load } from "./utils";
import { AssetType } from "./constants";
import { Scenes, Maps, ScenesConfig, Tilesets, PhaserEngineConfig } from "./types";
import { createChunks } from "./createChunks";
import { createCamera } from "./createCamera";
import { createCulling } from "./createCulling";
import { createObjectPool } from "./createObjectPool";
import { createAnimatedTilemap } from "./tilemap";
import { generateFrames } from "./utils";
import { createInput } from "./createInput";
import { deferred } from "@latticexyz/utils";

export async function createPhaserEngine<S extends ScenesConfig>(options: PhaserEngineConfig<S>) {
  const { scale, sceneConfig, cameraConfig, cullingChunkSize } = options;

  // Set up Phaser scenes
  const sceneConstructors = Object.keys(sceneConfig).map((key) => {
    const { preload, create, update } = sceneConfig[key];
    return defineScene({ key, preload, create, update });
  });

  const phaserConfig = definePhaserConfig({ scenes: sceneConstructors, scale });
  const game = new Phaser.Game(phaserConfig);

  // Wait for phaser to boot
  const [resolve, , promise] = deferred();

  game.events.on("ready", resolve);

  // skip texture loading in headless mode for unit testing
  if (phaserConfig.type == Phaser.HEADLESS) {
    game.textures.emit("ready");
  }

  await promise;

  // Bind the game's size to the window size
  function resize() {
    const width = window.innerWidth / game.scale.zoom;
    const height = window.innerHeight / game.scale.zoom;
    game.scale.resize(width, height);
  }
  resize();
  window.addEventListener("resize", resize);

  // Create scenes object
  const partialScenes: Partial<Scenes<S>> = {};

  for (const phaserScene of game.scene.getScenes(false)) {
    const key = phaserScene.scene.key as keyof S;
    const config = sceneConfig[key];

    // Load assets
    for (const [assetKey, asset] of Object.entries(sceneConfig[key].assets)) {
      await load(phaserScene, (loader) => {
        if (asset.type === AssetType.Image) {
          loader.image(assetKey, asset.path);
        } else if (asset.type === AssetType.SpriteSheet) {
          loader.spritesheet(assetKey, asset.path, asset.options);
        } else if (asset.type === AssetType.MultiAtlas) {
          loader.multiatlas(assetKey, asset.path, asset.options.imagePath);
        }
      });
    }

    // Setup object pool
    const objectPool = createObjectPool(phaserScene);

    // Setup camera
    const camera = createCamera(phaserScene.cameras.main, cameraConfig);

    // Setup chunks for viewport culling
    const cullingChunks = createChunks(camera.worldView$, cullingChunkSize);

    // Setup viewport culling
    const culling = createCulling(objectPool, camera, cullingChunks);

    // Setup sprite animations
    for (const anim of config.animations) {
      phaserScene.anims.create({
        key: anim.key,
        frames: generateFrames(phaserScene.anims, anim),
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    }

    // Setup tilesets
    const emptyMap = new Phaser.Tilemaps.Tilemap(phaserScene, new Phaser.Tilemaps.MapData());
    const partialTilesets: Tilesets<string> = {};
    for (const [tilesetKey, { assetKey, tileWidth, tileHeight }] of Object.entries(sceneConfig[key]["tilesets"])) {
      partialTilesets[tilesetKey] = emptyMap.addTilesetImage(tilesetKey, assetKey, tileWidth, tileHeight);
    }
    const tilesets = partialTilesets as Tilesets<keyof S[typeof key]["tilesets"]>;

    // Setup maps
    const partialMaps: Partial<Maps<keyof S[typeof key]["maps"]>> = {};
    for (const mapKey of Object.keys(config.maps)) {
      const { layers, backgroundTile, tileWidth, tileHeight, animationInterval, tileAnimations, chunkSize } =
        config.maps[mapKey];

      // Setup chunks
      const chunks = createChunks(camera.worldView$, chunkSize);

      const map = createAnimatedTilemap({
        scene: phaserScene,
        tilesets,
        layerConfig: layers,
        chunks,
        tileWidth,
        tileHeight,
        backgroundTile,
        animationInterval,
      });

      // Register tilemap animations
      if (tileAnimations) {
        for (const [key, frames] of Object.entries(tileAnimations)) {
          map.registerAnimation(key, frames);
        }
      }

      partialMaps[mapKey as keyof typeof sceneConfig[typeof key]["maps"]] = map;
    }
    const maps = partialMaps as Maps<keyof S[typeof key]["maps"]>;

    const input = createInput(phaserScene.input);

    partialScenes[key] = { phaserScene, objectPool, camera, culling, maps, input, config: sceneConfig[key] };
  }
  const scenes = partialScenes as Scenes<S>;

  return {
    game,
    scenes,
    dispose: () => {
      game.destroy(true);
      for (const key of Object.keys(scenes)) {
        const scene = scenes[key];
        scene.camera.dispose();
        scene.culling.dispose();
        scene.input.dispose();
        for (const map of Object.values(scene.maps)) {
          map.dispose();
        }
      }

      window.removeEventListener("resize", resize);
    },
  };
}
