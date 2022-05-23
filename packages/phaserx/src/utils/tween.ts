import { deferred } from "@latticexyz/utils";

type TweenBuilderConfig = { targets: Phaser.GameObjects.Sprite } & Omit<
  Phaser.Types.Tweens.TweenBuilderConfig,
  "targets"
>;

/**
 * Add a tween to the provided game object.
 * @returns Promise that resolves when the tween is done.
 */
export async function tween(config: TweenBuilderConfig) {
  const [resolve, , promise] = deferred<void>();
  const { targets } = config;
  if (!targets.scene || !targets.scene.tweens) return;

  // Kill old tweens
  removeAllTweens(targets);

  // Add new tween
  targets.scene.tweens.add({
    ...config,
    onComplete: (tween, targets) => {
      config.onComplete && config.onComplete(tween, targets);
      resolve();
    },
  });
  return promise;
}

export function removeAllTweens(gameObject: Phaser.GameObjects.GameObject) {
  // Access some hidden tween manager properties because tweenManager.getTweensOf does not return tweens in _add
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tweenManager = gameObject.scene.tweens as any;
  if (!tweenManager) return;
  const allTweens = [...tweenManager._add, ...tweenManager._pending, ...tweenManager._active] as Phaser.Tweens.Tween[];
  for (const tween of allTweens) if (tween.hasTarget(gameObject)) tween.stop();
}
