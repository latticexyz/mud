import { defineComponent, removeComponent, setComponent, withValue } from "./Component";
import { Type, UpdateType } from "./constants";
import { createEntity } from "./Entity";
import { Has } from "./Query";
import { defineEnterSystem, defineExitSystem, defineSystem, defineUpdateSystem } from "./System";
import { Component, Entity, World } from "./types";
import { createWorld } from "./World";

describe("System", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe("Systems", () => {
    let Position: Component<{ x: number; y: number }>;
    let entity: Entity;

    beforeEach(() => {
      Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      entity = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
    });

    it("defineSystem should rerun the system if the query result changes (enter, update, exit)", () => {
      const mock = jest.fn();
      defineSystem(world, [Has(Position)], mock);

      setComponent(Position, entity, { x: 2, y: 3 });

      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenCalledWith({
        entity,
        component: Position,
        value: [
          { x: 2, y: 3 },
          { x: 1, y: 2 },
        ],
        type: UpdateType.Update,
      });

      setComponent(Position, entity, { x: 3, y: 3 });
      expect(mock).toHaveBeenCalledTimes(3);
      expect(mock).toHaveBeenCalledWith({
        entity,
        component: Position,
        value: [
          { x: 3, y: 3 },
          { x: 2, y: 3 },
        ],
        type: UpdateType.Update,
      });

      removeComponent(Position, entity);
      expect(mock).toHaveBeenCalledTimes(4);
      expect(mock).toHaveBeenCalledWith({
        entity,
        component: Position,
        value: [undefined, { x: 3, y: 3 }],
        type: UpdateType.Exit,
      });
    });

    it("defineUpdateSystem should rerun the system if the component value of an entity matchign the query changes", () => {
      const mock = jest.fn();
      defineUpdateSystem(world, [Has(Position)], mock);

      // The entity already had a position when the system was created and the system runs on init,
      // so this position update is an update
      setComponent(Position, entity, { x: 2, y: 3 });
      expect(mock).toHaveBeenCalledTimes(1);

      setComponent(Position, entity, { x: 2, y: 3 });
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenCalledWith({
        entity,
        component: Position,
        value: [
          { x: 2, y: 3 },
          { x: 2, y: 3 },
        ],
        type: UpdateType.Update,
      });

      // Setting the same value again should rerun the system
      setComponent(Position, entity, { x: 2, y: 3 });
      expect(mock).toHaveBeenCalledTimes(3);

      setComponent(Position, entity, { x: 3, y: 3 });
      expect(mock).toHaveBeenCalledTimes(4);
    });

    it("defineEnterSystem should rerun once with entities matching the query for the first time", () => {
      const CanMove = defineComponent(world, { value: Type.Boolean });
      const mock = jest.fn();

      defineEnterSystem(world, [Has(CanMove)], mock);

      const entity1 = createEntity(world, [withValue(CanMove, { value: true })]);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({ entity: entity1, component: CanMove, value: [{ value: true }, undefined] })
      );

      const entity2 = createEntity(world, [withValue(CanMove, { value: true })]);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({ entity: entity2, component: CanMove, value: [{ value: true }, undefined] })
      );
    });

    it("defineExitSystem should rerun once with entities not matching the query anymore", () => {
      const CanMove = defineComponent(world, { value: Type.Boolean });

      const mock = jest.fn();
      defineExitSystem(world, [Has(CanMove)], mock);

      const entity1 = createEntity(world, [withValue(CanMove, { value: true })]);
      const entity2 = createEntity(world);
      setComponent(CanMove, entity2, { value: true });

      expect(mock).toHaveBeenCalledTimes(0);

      removeComponent(CanMove, entity1);

      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({ entity: entity1, component: CanMove, value: [undefined, { value: true }] })
      );

      removeComponent(CanMove, entity2);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({ entity: entity2, component: CanMove, value: [undefined, { value: true }] })
      );
    });
  });
});
