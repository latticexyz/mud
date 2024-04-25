import { deferred } from "@latticexyz/utils";

type TweenBuilderConfig = { targets: Phaser.GameObjects.Sprite } & Omit<
  Phaser.Types.Tweens.TweenBuilderConfig,
  "targets"
>;

/**
 * Add a tween to the provided game object.
 * @returns Promise that resolves when the tween is done.
 */
export async function tween(config: TweenBuilderConfig, options?: { keepExistingTweens?: boolean }) {
  const [resolve, , promise] = deferred<void>();
  const { targets } = config;
  if (!targets.scene || !targets.scene.tweens) return;

  // Kill old tweens
  if (!options?.keepExistingTweens) {
    removeAllTweens(targets);
  }

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
  const tweenManager = gameObject.scene.tweens;
  for (const tween of tweenManager.tweens) {
    if (tween.hasTarget(gameObject)) {
      tween.stop();
    }
  }
}
