import { Animation, Assets } from "../types";

export function generateFrames<A extends Assets>(
  anims: Phaser.Animations.AnimationManager,
  animation: Animation<A>
): Phaser.Types.Animations.AnimationFrame[] {
  if (animation.prefix && animation.suffix) {
    return anims.generateFrameNames(animation.assetKey, {
      start: animation.startFrame,
      end: animation.endFrame,
      prefix: animation.prefix,
      suffix: animation.suffix,
    });
  } else {
    return anims.generateFrameNumbers(animation.assetKey, { start: animation.startFrame, end: animation.endFrame });
  }
}
