import { AnimatedTilemap } from ".";
import { WorldCoord } from "../types";
import { mod } from "../utils";
import { CoordMap } from "@latticexyz/utils";
import { ChunkedTilemapConfig } from "./createChunkedTilemap";
import { createVirtualTilemap } from "./createVirtualTilemap";
import { TileAnimation } from "./types";

export function createAnimatedTilemap<TileKeys extends number, LayerKeys extends string, AnimationKeys extends string>(
  config: Omit<ChunkedTilemapConfig<TileKeys, string>, "tiles"> & { animationInterval: number }
): AnimatedTilemap<TileKeys, LayerKeys, AnimationKeys> {
  const {
    layerConfig: { layers, defaultLayer },
    animationInterval,
    scene,
  } = config;

  const defaultLayerKey = defaultLayer as LayerKeys;
  let lastStep = 0;
  const animations: { [key in AnimationKeys]?: { frames: TileAnimation<TileKeys>; index: number } } = {};

  const animatedTiles: { [key in LayerKeys]: CoordMap<AnimationKeys> } = {} as never;
  for (const layerKey of Object.keys(layers)) {
    animatedTiles[layerKey as LayerKeys] = new CoordMap<AnimationKeys>();
  }

  const pausedAnimations: { [key in LayerKeys]: CoordMap<AnimationKeys> } = {} as never;
  for (const layerKey of Object.keys(layers)) {
    pausedAnimations[layerKey as LayerKeys] = new CoordMap<AnimationKeys>();
  }

  const virtualTilemap = createVirtualTilemap(config);

  function registerAnimation(animationKey: AnimationKeys, frames: TileAnimation<TileKeys>) {
    animations[animationKey] = { frames, index: 0 };
  }

  function putAnimationAt(coord: WorldCoord, animationKey: AnimationKeys, layer: LayerKeys = defaultLayerKey) {
    animatedTiles[layer].set(coord, animationKey);
  }

  function removeAnimationAt(coord: WorldCoord, layer: LayerKeys = defaultLayerKey) {
    const animationKey = animatedTiles[layer].get(coord);
    const animation = animationKey && animations[animationKey];
    animatedTiles[layer].delete(coord);
    if (animation) virtualTilemap.putTileAt(coord, animation.frames[0], layer);
  }

  function pauseAnimationAt(coord: WorldCoord, layer: LayerKeys = defaultLayerKey) {
    const animationKey = animatedTiles[layer].get(coord);
    if (!animationKey) return;
    pausedAnimations[layer].set(coord, animationKey);
    removeAnimationAt(coord, layer);
  }

  function resumeAnimationAt(coord: WorldCoord, layer: LayerKeys = defaultLayerKey) {
    const animationKey = pausedAnimations[layer].get(coord);
    if (!animationKey) return;
    pausedAnimations[layer].delete(coord);
    putAnimationAt(coord, animationKey, layer);
  }

  function animationStep() {
    // Increase animation index for every animation
    for (const animationKey of Object.keys(animations) as AnimationKeys[]) {
      const animation = animations[animationKey];
      if (animation) animation.index = mod(animation.index + 1, animation.frames.length);
    }

    // Update every animated tile
    for (const layerKey of Object.keys(animatedTiles) as LayerKeys[]) {
      const layer = animatedTiles[layerKey];
      for (const coord of layer.coords()) {
        const animationKey = layer.get(coord);
        const animation = animationKey && animations[animationKey];
        if (!animation) continue;
        const currentFrame = animation.frames[animation.index];
        virtualTilemap.putTileAt(coord, currentFrame, layerKey);
      }
    }
  }

  function update(time: number) {
    if (time < lastStep + animationInterval) return;
    lastStep = time;
    animationStep();
  }

  function dispose() {
    scene.events.removeListener("update", update);
    virtualTilemap.dispose();
  }

  scene.events.addListener("update", update);

  return {
    ...virtualTilemap,
    putAnimationAt,
    removeAnimationAt,
    pauseAnimationAt,
    resumeAnimationAt,
    registerAnimation,
    dispose,
  } as unknown as AnimatedTilemap<TileKeys, LayerKeys, AnimationKeys>;
}
