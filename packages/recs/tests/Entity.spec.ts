import { defineComponent, getComponentValue, hasComponent, withValue } from "../src/Component";
import { Type } from "../src/constants";
import { createEntity } from "../src/Entity";
import { World } from "../src/types";
import { createWorld } from "../src/World";

describe("Entity", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe("createEntity", () => {
    it("should return a unique id", () => {
      const firstEntity = createEntity(world);
      const secondEntity = createEntity(world);
      expect(firstEntity).not.toEqual(secondEntity);
    });

    it("should register the entity in the world", () => {
      expect(world.entities.size).toEqual(0);
      createEntity(world);
      expect(world.entities.size).toEqual(1);
    });

    it("should create an entity with given components and values", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const CanMove = defineComponent(world, {});

      const value1 = { x: 1, y: 1 };
      const value2 = { x: 2, y: 1 };

      const movableEntity = createEntity(world, [withValue(Position, value1), withValue(CanMove, {})]);

      const staticEntity = createEntity(world, [withValue(Position, value2)]);

      expect(getComponentValue(Position, movableEntity)).toEqual(value1);
      expect(hasComponent(CanMove, movableEntity)).toBe(true);

      expect(getComponentValue(Position, staticEntity)).toEqual(value2);
      expect(hasComponent(CanMove, staticEntity)).toBe(false);
    });
  });
});
