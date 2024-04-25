import { EmbodiedEntity, GameObjectTypes } from "./types";
import { createEmbodiedEntity } from "./createEmbodiedEntity";
import { observable } from "mobx";
import { mapObject } from "@latticexyz/utils";
import { GameObjectClasses } from "./constants";

type ObjectPoolReturnType<Type> = Type extends keyof GameObjectTypes
  ? EmbodiedEntity<Type>
  : EmbodiedEntity<keyof GameObjectTypes> | undefined;

function isGameObjectType(t: string): t is keyof GameObjectTypes {
  return Object.keys(GameObjectClasses).includes(t);
}

export function createObjectPool(scene: Phaser.Scene) {
  const groups = mapObject(GameObjectClasses, (classType) => scene.add.group({ classType })) as {
    [key in keyof typeof GameObjectClasses]: Phaser.GameObjects.Group;
  };

  const objects = observable(new Map<string, EmbodiedEntity<keyof GameObjectTypes>>());
  const cameraFilter = { current: 0 };

  function get<Type extends keyof GameObjectTypes | "Existing">(
    entity: number | string,
    type: Type
  ): ObjectPoolReturnType<typeof type> {
    if (typeof entity === "number") entity = String(entity);
    let embodiedEntity = objects.get(entity);
    if (!isGameObjectType(type)) {
      if (!embodiedEntity) return undefined as ObjectPoolReturnType<typeof type>;
      return embodiedEntity as ObjectPoolReturnType<typeof type>;
    }

    // If the entity doesn't exist yet, we create a new one and track its chunk
    if (!embodiedEntity) {
      embodiedEntity = createEmbodiedEntity<typeof type>(entity, groups[type], type, cameraFilter.current);
    }

    if (!objects.has(entity)) {
      objects.set(entity, embodiedEntity);
    }

    // Don't spawn here, let culling take care of spawning
    // embodiedEntity.spawn();

    return embodiedEntity as ObjectPoolReturnType<typeof type>;
  }

  function remove(entity: number | string) {
    if (typeof entity === "number") entity = String(entity);
    const object = objects.get(entity);
    if (object) object.despawn();
    objects.delete(entity);
  }

  function ignoreCamera(cameraId: number, ignore: boolean) {
    if (ignore) {
      cameraFilter.current |= cameraId;
    } else {
      cameraFilter.current &= ~cameraId;
    }

    for (const embodiedEntity of objects.values()) {
      embodiedEntity.setCameraFilter(cameraFilter.current);
    }
  }

  return { get, remove, objects, groups, ignoreCamera };
}
