import { defineComponent, getComponentValue, removeComponent, setComponent, withValue } from "../src/Component";
import { Type } from "../src/constants";
import { createEntity } from "../src/Entity";
import { Has, defineQuery, defineEnterQuery, defineExitQuery, defineUpdateQuery } from "../src/Query";
import { defineAutorunSystem, defineSystem } from "../src/System";
import { Component, Entity, World } from "../src/types";
import { createWorld } from "../src/World";

describe("System", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe("defineSystem", () => {
    it("should return a callable system", () => {
      let called = false;
      const system = defineSystem(world, () => {
        called = true;
      });
      system();
      expect(called).toBe(true);
    });
  });

  describe("defineAutorunSystem", () => {
    let Position: Component<{ x: number; y: number }>;
    let entity: Entity;

    beforeEach(() => {
      Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      entity = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
    });

    it("should rerun the system if a used component value changed", () => {
      let ranTimes = 0;
      defineAutorunSystem(world, () => {
        getComponentValue(Position, entity);
        ranTimes++;
      });

      setComponent(Position, entity, { x: 2, y: 3 });
      expect(ranTimes).toBe(2);

      // Setting the same value again should not rerun the system
      setComponent(Position, entity, { x: 2, y: 3 });
      expect(ranTimes).toBe(2);

      setComponent(Position, entity, { x: 3, y: 3 });
      expect(ranTimes).toBe(3);
    });

    it("should rerun the system if a query changed", () => {
      let ranTimes = 0;
      const CanMove = defineComponent(world, {});
      const moveQuery = defineQuery([Has(CanMove)]);

      defineAutorunSystem(world, () => {
        moveQuery.get();
        ranTimes++;
      });

      setComponent(CanMove, entity, {});
      expect(ranTimes).toBe(2);

      // Setting the same component again should not change the query
      setComponent(CanMove, entity, { x: 1 });
      expect(ranTimes).toBe(2);

      removeComponent(CanMove, entity);
      expect(ranTimes).toBe(3);
    });

    it("should rerun once with the newly added entities", () => {
      const CanMove = defineComponent(world, {});
      const enterMoveQuery = defineEnterQuery(world, [Has(CanMove)]);
      const entity1 = createEntity(world, [withValue(CanMove, {})]);

      const mock = jest.fn<void, [Set<Entity>]>();

      defineAutorunSystem(world, () => {
        const newEntities = enterMoveQuery.get();
        mock(newEntities);
      });

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenNthCalledWith(1, new Set([entity1]));

      const entity2 = createEntity(world, [withValue(CanMove, {})]);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenNthCalledWith(2, new Set([entity2]));

      const entity3 = createEntity(world);
      setComponent(CanMove, entity3, {});

      expect(mock).toBeCalledTimes(3);
      expect(mock).toHaveBeenNthCalledWith(3, new Set([entity3]));
    });

    it("should rerun once with the removed entities", () => {
      const CanMove = defineComponent(world, {});
      const exitMoveQuery = defineExitQuery(world, [Has(CanMove)]);
      const entity1 = createEntity(world, [withValue(CanMove, {})]);
      const entity2 = createEntity(world);
      setComponent(CanMove, entity2, {});

      const mock = jest.fn<void, [Set<Entity>]>();

      defineAutorunSystem(world, () => {
        const removedEntities = exitMoveQuery.get();
        mock(removedEntities);
      });

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenNthCalledWith(1, new Set([]));

      removeComponent(CanMove, entity1);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenNthCalledWith(2, new Set([entity1]));

      removeComponent(CanMove, entity2);
      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock).toHaveBeenNthCalledWith(3, new Set([entity2]));
    });

    it("should only run on entites updated after the query was defined", () => {
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world);

      const updateQuery = defineUpdateQuery(world, [Has(Position)]);
      const mock = jest.fn<void, [Set<Entity>]>();

      defineAutorunSystem(world, () => {
        const updatedEntities = updateQuery.get();
        mock(updatedEntities);
      });

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenNthCalledWith(1, new Set([]));

      setComponent(Position, entity1, { x: 2, y: 6 });
      setComponent(Position, entity2, { x: 2, y: 6 });

      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock).toHaveBeenNthCalledWith(2, new Set([entity1]));
      expect(mock).toHaveBeenNthCalledWith(3, new Set([entity2]));
    });

    it("should run on all entities once and then only on the updated ones if runOnInit is true", () => {
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world);

      const updateQuery = defineUpdateQuery(world, [Has(Position)], { runOnInit: true });
      const mock = jest.fn<void, [Set<Entity>]>();

      defineAutorunSystem(world, () => {
        const updatedEntities = updateQuery.get();
        mock(updatedEntities);
      });

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenNthCalledWith(1, new Set([entity, entity1]));

      setComponent(Position, entity1, { x: 2, y: 6 });
      setComponent(Position, entity2, { x: 2, y: 6 });

      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock).toHaveBeenNthCalledWith(2, new Set([entity1]));
      expect(mock).toHaveBeenNthCalledWith(3, new Set([entity2]));
    });
  });

  describe("defineReactionSystem", () => {
    it.todo("should work as expected");
  });

  describe("defineSyncSystem", () => {
    it.todo("should work as expected");
  });
});
