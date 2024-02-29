import { observable, runInAction } from "mobx";
import { isRectangle, isSprite } from "./guards";
import {
  EmbodiedEntity,
  GameObject,
  GameObjectComponent,
  GameObjectFunction,
  GameObjectTypes,
  PixelCoord,
} from "./types";
import { removeAllTweens } from "./utils";

export function createEmbodiedEntity<Type extends keyof GameObjectTypes>(
  id: string,
  group: Phaser.GameObjects.Group,
  type: Type,
  currentCameraFilter = 0
): EmbodiedEntity<Type> {
  const position: PixelCoord = observable({ x: 0, y: 0 });
  const onOnce = new Map<string, GameObjectFunction<Type>>();
  const onUpdate = new Map<string, GameObjectFunction<Type>>();
  let activeGameObject: GameObject<Type> | undefined;
  const cameraFilter = { current: currentCameraFilter };

  /**
   * Syncronizes updates to game object positions to the EmbodiedEntity's position
   */
  function trackPositionUpdates(func: GameObjectFunction<Type>): GameObjectFunction<Type> {
    if (!modifiesPosition(func)) return func;

    return (gameObject) => {
      func(gameObject);
      runInAction(() => {
        position.x = gameObject.x;
        position.y = gameObject.y;
      });
    };
  }

  /**
   * Stores and executes the component.
   * Once and Update functions are stored.
   * Now and Once functions are executed if there is an active game object.
   * Now is executed first and awaited, before Once is executed.
   * @param component: GameObjectComponent definition, including id, and optional functions for now, once and update
   */
  async function setComponent({ id, now, once, update }: GameObjectComponent<Type>) {
    // Handle position update when setting the component
    const newPosition = once && modifiesPosition(once);
    if (newPosition) {
      runInAction(() => {
        position.x = newPosition.x ?? position.x;
        position.y = newPosition.y ?? position.y;
      });
    }

    // Store functions
    once && onOnce.set(id, trackPositionUpdates(once));
    update && onUpdate.set(id, trackPositionUpdates(update));

    // Execute functions
    if (activeGameObject && now) await trackPositionUpdates(now)(activeGameObject);
    if (activeGameObject && once) once(activeGameObject);
  }

  function hasComponent(id: string): boolean {
    return onOnce.has(id) || onUpdate.has(id);
  }

  function removeComponent(id: string, stop?: boolean) {
    onOnce.delete(id);
    onUpdate.delete(id);

    // Reset the entity and reapply all onOnce components
    if (activeGameObject) {
      reset(activeGameObject, stop);
      executeGameObjectFunctions(activeGameObject, onOnce.values());
    }
  }

  function reset(gameObject: GameObject<Type>, stop = true) {
    if (stop) {
      if (isSprite(gameObject, type)) gameObject.stop();
      removeAllTweens(gameObject);
    }
    gameObject.setDepth(10);
    gameObject.cameraFilter = cameraFilter.current;
    gameObject.resetPipeline(true, true);
    gameObject.setScale(1, 1);
    gameObject.setOrigin(0, 0);
    gameObject.setAlpha(1);
    gameObject.setScrollFactor(1);
    gameObject.clearMask();
    gameObject.setData("objectPoolId", null);
    if (isSprite(gameObject, type)) {
      gameObject.clearTint();
      gameObject.setTexture("");
    }
    if (isRectangle(gameObject, type)) {
      gameObject.width = 0;
      gameObject.height = 0;
    }
  }

  function setCameraFilter(filter: number) {
    cameraFilter.current = filter;
    if (activeGameObject) activeGameObject.cameraFilter = filter;
  }

  function spawn() {
    if (activeGameObject) return;
    const gameObject: GameObject<Type> = group.get();
    reset(gameObject);

    // Run all functions that are supposed to run once
    executeGameObjectFunctions(gameObject, onOnce.values());

    // Bind all functions that are supposed to run on update
    // gameObject.onUpdate = () => executeGameObjectFunctions(gameObject, onUpdate.values());

    gameObject.setActive(true);
    gameObject.setVisible(true);
    gameObject.setData("objectPoolId", id);
    activeGameObject = gameObject;
  }

  function despawn() {
    if (activeGameObject) {
      group.killAndHide(activeGameObject);
    }
    activeGameObject = undefined;
  }

  return { setComponent, hasComponent, removeComponent, spawn, despawn, position, id, setCameraFilter, type };
}

function executeGameObjectFunctions<Type extends keyof GameObjectTypes>(
  gameObject: GameObject<Type>,
  functions: Iterable<GameObjectFunction<Type>>
) {
  if (!gameObject) return;
  for (const func of functions) {
    func(gameObject);
  }
}

function modifiesPosition<Type extends keyof GameObjectTypes>(
  func: GameObjectFunction<Type>
): Partial<PixelCoord> | undefined {
  let newPosition: Partial<PixelCoord> | undefined = undefined;
  const gameObjectProxy = new Proxy(
    { x: undefined, y: undefined },
    {
      get: (_, prop) => {
        if (prop === "setPosition") return (x: number, y: number) => (newPosition = { x, y });
        if (prop === "setX") return (x: number) => (newPosition = { x });
        if (prop === "setY") return (y: number) => (newPosition = { y });
        return () => void 0;
      },
      set: (_, prop, value) => {
        if (prop === "x") newPosition = newPosition ? { ...newPosition, x: value } : { x: value };
        if (prop === "y") newPosition = newPosition ? { ...newPosition, y: value } : { y: value };
        return true;
      },
    }
  );
  func(gameObjectProxy as GameObject<Type>);
  return newPosition;
}
