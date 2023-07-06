import { HueTintAndOutlineFXPipeline, MultiHueTintPipeline } from "./pipelines";

export function defineScene(options: {
  key: string;
  init?: (scene: Phaser.Scene, data: any) => void;
  preload?: (scene: Phaser.Scene) => void;
  create?: (scene: Phaser.Scene, data: any) => void;
  update?: (scene: Phaser.Scene, time: number, delta: number) => void;
}) {
  const { init, preload, create, update, key } = options;
  return class GameScene extends Phaser.Scene {
    constructor() {
      super({ key });
    }

    init(data: any) {
      init && init(this, data);
    }

    preload() {
      preload && preload(this);
    }

    create(data: any) {
      create && create(this, data);
      const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      if (renderer?.pipelines) {
        renderer.pipelines.add(HueTintAndOutlineFXPipeline.KEY, new HueTintAndOutlineFXPipeline(this.game));
        renderer.pipelines.add(MultiHueTintPipeline.KEY, new MultiHueTintPipeline(this.game));
      }
    }

    update(time: number, delta: number) {
      update && update(this, time, delta);
    }
  };
}
