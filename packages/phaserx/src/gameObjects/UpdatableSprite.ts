export class UpdatableSprite extends Phaser.GameObjects.Sprite {
  onUpdate?: () => void;
  update(): void {
    this.onUpdate && this.onUpdate();
  }
}
