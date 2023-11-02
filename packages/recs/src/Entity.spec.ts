import { defineComponent, getComponentValue, hasComponent, withValue } from "./Component";
import { Type } from "./constants";
import { createEntity } from "./Entity";
import { World } from "./types";
import { createWorld } from "./World";

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
      expect([...world.getEntities()].length).toEqual(0);
      createEntity(world);
      expect([...world.getEntities()].length).toEqual(1);
    });

    it("should create an entity with given components and values", () => {
      const Position = defineComponent(world, { vec: { x: Type.Number, y: Type.Number } });
      const CanMove = defineComponent(world, { value: Type.Boolean });

      const value1 = { vec: { x: 1, y: 1 } };
      const value2 = { vec: { x: 2, y: 1 } };

      const movableEntity = createEntity(world, [withValue(Position, value1), withValue(CanMove, { value: true })]);

      const staticEntity = createEntity(world, [withValue(Position, value2)]);

      expect(getComponentValue(Position, movableEntity)).toEqual(value1);
      expect(hasComponent(CanMove, movableEntity)).toBe(true);

      expect(getComponentValue(Position, staticEntity)).toEqual(value2);
      expect(hasComponent(CanMove, staticEntity)).toBe(false);
    });
  });
});
