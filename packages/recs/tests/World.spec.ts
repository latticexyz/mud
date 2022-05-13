import { observe, reaction } from "mobx";
import { Subject } from "rxjs";
import { defineComponent, setComponent, withValue } from "../src/Component";
import { Type } from "../src/constants";
import { createEntity } from "../src/Entity";
import { World, AnyComponent, Entity } from "../src/types";
import { setEquals } from "../src/Utils/Equals";
import { createWorld, extendWorld, getEntityComponents } from "../src/World";

describe("World", () => {
  describe("createWorld", () => {
    let world: World;

    beforeEach(() => {
      world = createWorld();
    });
    describe("entities", () => {
      it("should be observable", () => {
        let changed = false;
        reaction(
          () => world.entities.size,
          () => {
            changed = true;
          }
        );
        createEntity(world);

        expect(changed).toBe(true);
      });
    });

    describe("components", () => {
      it("should be observable", () => {
        let changed = false;
        reaction(
          () => world.components.size,
          () => {
            changed = true;
          }
        );
        createEntity(world);
        defineComponent(world, {});
        expect(changed).toBe(true);
      });
    });

    describe("registerEntity", () => {
      it("should add the entitiy to the world's entities", () => {
        expect(world.entities.size).toBe(0);

        const entity = world.registerEntity();
        expect(world.entities.size).toBe(1);
        expect(world.entities.get(entity)).not.toBe(undefined);
        expect(world.entities.get(entity)?.size).toBe(0);
      });
    });

    describe("registerComponent", () => {
      let rawComponent: AnyComponent;

      beforeEach(() => {
        rawComponent = {
          id: "random-id",
          values: {
            value: new Map<Entity, number>(),
          },
          entities: new Set<Entity>(),
          stream$: new Subject(),
        };
      });

      it("should add the component to the world's components", () => {
        expect(world.components.size).toBe(0);
        const component = world.registerComponent(rawComponent);
        expect(world.components.size).toBe(1);
        expect(world.components.has(component)).toBe(true);
      });

      it("should return an observable component", () => {
        const observableComponent = world.registerComponent(rawComponent);
        const entity = createEntity(world);
        let entitiesChanged = false;
        let valuesChanged = false;

        observe(observableComponent.entities, () => {
          entitiesChanged = true;
        });

        observe(observableComponent.values.value, () => {
          valuesChanged = true;
        });

        setComponent(observableComponent, entity, { value: 1 });

        expect(entitiesChanged).toBe(true);
        expect(valuesChanged).toBe(true);
      });
    });

    describe("getEntitiyComponents", () => {
      it("should return the set of components of a given entity", () => {
        const components = new Set<AnyComponent>([
          defineComponent(world, { value: Type.Number }),
          defineComponent(world, { value: Type.Number }),
          defineComponent(world, { value: Type.Number }),
        ]);
        const entity = createEntity(world);
        const value = 1;

        for (const component of components) {
          setComponent(component, entity, { value });
        }

        const received = getEntityComponents(world, entity);
        expect(received.size).toEqual(components.size);

        for (const comp of received) {
          expect(components.has(comp)).toBe(true);
        }

        for (const comp of components) {
          expect(received.has(comp)).toBe(true);
        }
      });
    });
  });

  describe("extendWorld", () => {
    let parentWorld: World;
    let extendedWorld: World;

    beforeEach(() => {
      parentWorld = createWorld();
      extendedWorld = extendWorld(parentWorld);
    });

    it("should not be possible to register child entities on parent components", () => {
      const Position = defineComponent(parentWorld, { value: Type.Number });
      let error = false;

      try {
        createEntity(extendedWorld, [withValue(Position, { value: 1 })]);
      } catch (e) {
        error = true;
      }

      expect(error).toBe(true);
    });

    describe("entities", () => {
      it("should be observable", () => {
        let changed = 0;
        reaction(
          () => extendedWorld.entities.size,
          () => {
            changed++;
          }
        );
        createEntity(parentWorld);
        expect(changed).toBe(1);
        createEntity(extendedWorld);
        expect(changed).toBe(2);
      });
    });

    describe("components", () => {
      it("should be observable", () => {
        let changed = 0;
        reaction(
          () => extendedWorld.components.size,
          () => {
            changed++;
          }
        );
        defineComponent(parentWorld, {});
        expect(changed).toBe(1);
        defineComponent(extendedWorld, {});
        expect(changed).toBe(2);
      });
    });

    describe("registerEntity", () => {
      it("should add a new entitiy to the extended world's entities", () => {
        expect(parentWorld.entities.size).toBe(0);
        expect(extendedWorld.entities.size).toBe(0);

        const entity = extendedWorld.registerEntity();
        expect(extendedWorld.entities.size).toBe(1);
        expect(parentWorld.entities.size).toBe(0);
        expect(parentWorld.entities.get(entity)).toBe(undefined);
        expect(extendedWorld.entities.get(entity)?.size).toBe(0);
      });
    });

    describe("registerComponent", () => {
      let rawComponent: AnyComponent;

      beforeEach(() => {
        rawComponent = {
          id: "random-id",
          values: {
            value: new Map<Entity, number>(),
          },
          entities: new Set<Entity>(),
          stream$: new Subject(),
        };
      });

      it("should add the component to the extended world's components", () => {
        expect(parentWorld.components.size).toBe(0);
        expect(extendedWorld.components.size).toBe(0);
        const component = extendedWorld.registerComponent(rawComponent);
        expect(extendedWorld.components.size).toBe(1);
        expect(extendedWorld.components.has(component)).toBe(true);
        expect(parentWorld.components.size).toBe(0);
        expect(parentWorld.components.has(component)).toBe(false);
      });

      it("should add the component to the parent world's components", () => {
        expect(parentWorld.components.size).toBe(0);
        expect(extendedWorld.components.size).toBe(0);
        const component = parentWorld.registerComponent(rawComponent);
        expect(extendedWorld.components.size).toBe(1);
        expect(extendedWorld.components.has(component)).toBe(true);
        expect(parentWorld.components.size).toBe(1);
        expect(parentWorld.components.has(component)).toBe(true);
      });

      it("should return an observable component", () => {
        const observableComponent = extendedWorld.registerComponent(rawComponent);
        const entity = createEntity(parentWorld);
        let entitiesChanged = false;
        let valuesChanged = false;

        observe(observableComponent.entities, () => {
          entitiesChanged = true;
        });

        observe(observableComponent.values.value, () => {
          valuesChanged = true;
        });

        setComponent(observableComponent, entity, { value: 1 });

        expect(entitiesChanged).toBe(true);
        expect(valuesChanged).toBe(true);
      });
    });

    describe("getEntitiyComponents", () => {
      it("should return the set of components of a given entity", () => {
        const components = new Set<AnyComponent>([
          defineComponent(parentWorld, { value: Type.Number }),
          defineComponent(parentWorld, { value: Type.Number }),
          defineComponent(extendedWorld, { value: Type.Number }),
        ]);
        const entity = createEntity(parentWorld);
        const value = 1;

        for (const component of components) {
          setComponent(component, entity, { value });
        }

        const received = getEntityComponents(extendedWorld, entity);

        expect(received.size).toEqual(components.size);

        for (const comp of received) {
          expect(components.has(comp)).toBe(true);
        }

        for (const comp of components) {
          expect(received.has(comp)).toBe(true);
        }
      });

      it("should be possible to add parent entities to child components without messing up the parent world", () => {
        const Position = defineComponent(parentWorld, { x: Type.Number, y: Type.Number });
        const parentEntity = createEntity(parentWorld, [withValue(Position, { x: 1, y: 2 })]);
        expect(setEquals(getEntityComponents(parentWorld, parentEntity), [Position])).toBe(true);

        const ChildPosition = defineComponent(extendedWorld, { x: Type.Number, y: Type.Number });
        // Adding an extended world's component to a parent entitiy
        setComponent(ChildPosition, parentEntity, { x: 10, y: 20 });
        // In the parent world, the entity should not have this component
        expect(setEquals(getEntityComponents(parentWorld, parentEntity), [Position])).toBe(true);
        // In the extended world, the entity should have this component
        expect(setEquals(getEntityComponents(extendedWorld, parentEntity), [Position, ChildPosition])).toBe(true);
      });
    });

    describe("registerSystem", () => {
      it.todo("should register a system disposer");
    });

    describe("disposeSystems", () => {
      it.todo("should dispose all reistered systems");
    });
  });
});
