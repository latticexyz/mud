import { AnyComponent, Entity, World } from "./types";
import { uuid } from "@latticexyz/utils";
import { observable, observe } from "mobx";
import { SuperSet, SuperSetMap } from "./Utils";

export function createWorld(options?: { parentWorld?: World; name?: string }): World {
  const components = new SuperSet<AnyComponent>({ parent: options?.parentWorld?.components });
  const entities = new SuperSetMap<Entity, AnyComponent>({ parent: options?.parentWorld?.entities });
  const systemDisposer = new Set<() => void>();
  const prefix = options?.name || uuid();

  function registerEntity(id?: string): Entity {
    const entity = id || prefix + "/" + entities.size;
    entities.init(entity);
    return entity;
  }

  function registerComponent<T extends AnyComponent>(component: T) {
    const observableComponent = observable(component);
    components.add(observableComponent);

    observe(observableComponent.entities, (change) => {
      if (change.type === "add") {
        const entity = change.newValue;
        if (!entities.get(entity)) throw new Error("Entity is not registered in this world.");
        entities.add(change.newValue, observableComponent);
      }

      if (change.type === "delete") {
        entities.deleteValue(change.oldValue, observableComponent);
      }
    });

    return observableComponent;
  }

  function registerDisposer(disposer: () => void) {
    systemDisposer.add(disposer);
  }

  function disposeAll() {
    for (const dispose of systemDisposer.values()) {
      dispose();
    }
    systemDisposer.clear();
  }

  function getEntityComponents(entity: Entity): Set<AnyComponent> {
    const entityComponents = entities.get(entity);
    if (!entityComponents) throw new Error("Entity is not registered in this world");
    return entityComponents;
  }

  return {
    components,
    entities,
    registerComponent,
    registerEntity,
    getEntityComponents,
    registerDisposer,
    disposeAll,
  };
}

export function extendWorld(parentWorld: World): World {
  return createWorld({ parentWorld });
}

export function getEntityComponents(world: World, entity: Entity) {
  return world.getEntityComponents(entity);
}
