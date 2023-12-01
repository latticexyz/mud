import { GameScene } from "./types";

export function definePhaserConfig(options: {
  scenes: GameScene[];
  scale: Phaser.Types.Core.GameConfig["scale"];
  renderOverrides?: Partial<Phaser.Types.Core.RenderConfig>;
}): Phaser.Types.Core.GameConfig {
  const defaultRenderConfig: Phaser.Types.Core.RenderConfig = {
    antialiasGL: false,
    pixelArt: true,
  };

  const renderConfig = {
    ...defaultRenderConfig,
    ...options.renderOverrides,
  };

  return {
    type: Phaser.WEBGL,
    scale: options.scale,
    autoFocus: true,
    render: renderConfig,
    scene: options.scenes,
  };
}
