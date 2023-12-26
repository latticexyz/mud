import { EmbodiedEntity, GameObjectTypes } from "./types";
import { createEmbodiedEntity } from "./createEmbodiedEntity";
import { mapObject } from "@latticexyz/utils";
import { GameObjectClasses } from "./constants";
import { BehaviorSubject, Observable, of } from "rxjs";

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

  const objects = new BehaviorSubject(new Map<string, EmbodiedEntity<keyof GameObjectTypes>>());
  const cameraFilter = new BehaviorSubject(0);

  function get<Type extends keyof GameObjectTypes | "Existing">(
    entity: number | string,
    type: Type
  ): Observable<ObjectPoolReturnType<typeof type>> {
    if (typeof entity === "number") entity = String(entity);
    let embodiedEntity = objects.value.get(entity);

    if (!isGameObjectType(type)) {
      if (!embodiedEntity) {
        return of(undefined as ObjectPoolReturnType<typeof type>);
      }
      return new BehaviorSubject(embodiedEntity as ObjectPoolReturnType<typeof type>);
    }

    // If the entity doesn't exist yet, we create a new one and track its chunk
    if (!embodiedEntity) {
      embodiedEntity = createEmbodiedEntity<typeof type>(entity, groups[type], type, cameraFilter.value);
      objects.next(objects.value.set(entity, embodiedEntity));
    }

    if (!objects.value.has(entity)) {
      const updatedObjects = new Map(objects.value);
      updatedObjects.set(entity, embodiedEntity);
      objects.next(updatedObjects);
    }

    // Don't spawn here, let culling take care of spawning
    // embodiedEntity.spawn();

    return new BehaviorSubject(embodiedEntity as ObjectPoolReturnType<typeof type>);
  }

  function remove(entity: number | string) {
    if (typeof entity === "number") entity = String(entity);
    const object = objects.value.get(entity);
    if (object) object.despawn();
    const updatedObjects = new Map(objects.value);
    updatedObjects.delete(entity);
    objects.next(updatedObjects);
  }

  function ignoreCamera(cameraId: number, ignore: boolean) {
    let currentFilter = cameraFilter.value;
    if (ignore) {
      currentFilter |= cameraId;
    } else {
      currentFilter &= ~cameraId;
    }
    cameraFilter.next(currentFilter);

    objects.value.forEach((embodiedEntity) => {
      embodiedEntity.setCameraFilter(currentFilter);
    });
  }

  return { get, remove, objects, groups, ignoreCamera };
}
