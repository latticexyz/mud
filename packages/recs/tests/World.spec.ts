import { arrayToIterator } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { defineComponent, setComponent } from "../src/Component";
import { Type } from "../src/constants";
import { createEntity } from "../src/Entity";
import { World, AnyComponent, EntityIndex } from "../src/types";
import { createWorld, getEntityComponents } from "../src/World";

describe("World", () => {
  describe("createWorld", () => {
    let world: World;

    beforeEach(() => {
      world = createWorld();
    });

    describe("registerEntity", () => {
      it("should add the entitiy to the world's entities", () => {
        expect(world.entities.length).toBe(0);

        world.registerEntity();
        expect(world.entities.length).toBe(1);
        expect(world.entities[0]).not.toBe(undefined);
      });
    });

    describe("registerComponent", () => {
      let rawComponent: AnyComponent;

      beforeEach(() => {
        rawComponent = {
          id: "some-id",
          values: {
            value: new Map<EntityIndex, number>(),
          },
          update$: new Subject(),
          schema: { value: Type.Number },
          metadata: {},
          entities: () => arrayToIterator([]),
          world,
        };
      });

      it("should add the component to the world's components", () => {
        expect(world.components.length).toBe(0);
        world.registerComponent(rawComponent);
        expect(world.components.length).toBe(1);
        expect(world.components.includes(rawComponent)).toBe(true);
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
          expect(received.length).toEqual(components.size);

          for (const comp of received) {
            expect(components.has(comp)).toBe(true);
          }

          for (const comp of components) {
            expect(received.includes(comp)).toBe(true);
          }
        });
      });
    });
  });
});
