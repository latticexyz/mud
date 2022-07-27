import { HueTintAndOutlineFXPipeline, MultiHueTintPipeline } from "./pipelines";

export function defineScene(options: {
  key: string;
  preload?: (scene: Phaser.Scene) => void;
  create?: (scene: Phaser.Scene) => void;
  update?: (scene: Phaser.Scene) => void;
}) {
  const { preload, create, update, key } = options;
  return class GameScene extends Phaser.Scene {
    constructor() {
      super({ key });
    }

    preload() {
      preload && preload(this);
    }

    create() {
      create && create(this);
      if (this.renderer) {
        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        renderer.pipelines.add(HueTintAndOutlineFXPipeline.KEY, new HueTintAndOutlineFXPipeline(this.game));
        renderer.pipelines.add(MultiHueTintPipeline.KEY, new MultiHueTintPipeline(this.game));
      }
    }

    update() {
      update && update(this);
    }
  };
}
