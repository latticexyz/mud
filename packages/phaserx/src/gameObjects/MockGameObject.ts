/* eslint-disable @typescript-eslint/no-explicit-any */
type Method<F> = F extends (...args: any[]) => any ? F : never;

type Mock = Partial<{
  [K in keyof typeof Phaser.GameObjects.Sprite.prototype]: Parameters<
    Method<(typeof Phaser.GameObjects.Sprite.prototype)[K]>
  >;
}>;

export class MockGameObject extends Phaser.GameObjects.Sprite {
  public called: Mock = {};
  public clearCalled() {
    this.called = {};
  }

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "");
  }

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    if (this.called) this.called.setPosition = [x, y, z, w];
    return super.setPosition(x, y, z, w);
  }
}
