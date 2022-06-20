import { reaction, runInAction } from "mobx";
import { defineComponent, removeComponent, setComponent, withValue } from "../src/Component";
import { Type } from "../src/constants";
import { createEntity } from "../src/Entity";
import {
  Has,
  Not,
  defineQuery,
  defineEnterQuery,
  defineExitQuery,
  defineUpdateQuery,
  HasValue,
  NotValue,
  ProxyRead,
  ProxyExpand,
} from "../src/Query";
import { Component, World } from "../src/types";
import { createWorld } from "../src/World";

describe("Query", () => {
  let world: World;

  let Position: Component<{
    x: Type.Number;
    y: Type.Number;
  }>;

  let CanMove: Component<Record<string, never>>;

  let OwnedByEntity: Component<{ value: Type.Entity }>;

  let Prototype: Component<Record<string, never>>;

  let FromPrototype: Component<{ value: Type.Entity }>;

  let Name: Component<{ name: Type.String }>;

  beforeEach(() => {
    world = createWorld();

    Position = defineComponent(world, { x: Type.Number, y: Type.Number });
    CanMove = defineComponent(world, {});
    Name = defineComponent(world, { name: Type.String });
    OwnedByEntity = defineComponent(world, { value: Type.Entity });
    Prototype = defineComponent(world, {});
    FromPrototype = defineComponent(world, { value: Type.Entity });
  });

  describe("defineQuery", () => {
    it("should return all entities with Position and CanMove component", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, {})]);
      const Structure = createEntity(world, [withValue(Position, { x: 2, y: 3 })]);

      const movableEntityQuery = defineQuery([Has(CanMove), Has(Position)]);
      const staticEntityQuery = defineQuery([Has(Position), Not(CanMove)]);

      const movableEntities = movableEntityQuery.get();
      const staticEntities = staticEntityQuery.get();

      expect(movableEntities).toEqual(new Set([Creature1, Creature2]));
      expect(movableEntities.has(Structure)).toBe(false);

      expect(staticEntities).toEqual(new Set([Structure]));
    });

    it("should return all entities with the given values for the Position component", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, {})]);
      const Creature3 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      const valueQuery1 = defineQuery([HasValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery1.get()).toEqual(new Set([Creature2, Creature3]));

      const valueQuery2 = defineQuery([Has(CanMove), HasValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery2.get()).toEqual(new Set([Creature2]));

      const valueQuery3 = defineQuery([Has(CanMove), HasValue(Position, { x: 1, y: 2 })]);
      expect(valueQuery3.get()).toEqual(new Set([Creature1]));
    });

    it("should return all entities with Position component except of a specific value", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, {})]);
      const Creature3 = createEntity(world, [withValue(Position, { x: 2, y: 1 })]);

      const valueQuery1 = defineQuery([Has(Position), NotValue(Position, { x: 1, y: 2 })]);
      expect(valueQuery1.get()).toEqual(new Set([Creature2, Creature3]));

      const valueQuery2 = defineQuery([Has(CanMove), NotValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery2.get()).toEqual(new Set([Creature1]));
    });

    it("should return all player owned entities up to the given depth", () => {
      const Player = createEntity(world);
      const Depth1 = createEntity(world, [withValue(OwnedByEntity, { value: Player })]);
      const Depth2 = createEntity(world, [withValue(OwnedByEntity, { value: Depth1 })]);
      const Depth3 = createEntity(world, [withValue(OwnedByEntity, { value: Depth2 })]);
      const Depth4 = createEntity(world, [withValue(OwnedByEntity, { value: Depth3 })]);
      const Depth5 = createEntity(world, [withValue(OwnedByEntity, { value: Depth4 })]);

      expect(defineQuery([HasValue(OwnedByEntity, { value: Player })]).get()).toEqual(new Set([Depth1]));

      expect(defineQuery([ProxyExpand(OwnedByEntity, 0), HasValue(OwnedByEntity, { value: Player })]).get()).toEqual(
        new Set([Depth1])
      );

      expect(defineQuery([ProxyExpand(OwnedByEntity, 1), HasValue(OwnedByEntity, { value: Player })]).get()).toEqual(
        new Set([Depth1, Depth2])
      );

      expect(defineQuery([ProxyExpand(OwnedByEntity, 2), HasValue(OwnedByEntity, { value: Player })]).get()).toEqual(
        new Set([Depth1, Depth2, Depth3])
      );

      expect(defineQuery([ProxyExpand(OwnedByEntity, 3), HasValue(OwnedByEntity, { value: Player })]).get()).toEqual(
        new Set([Depth1, Depth2, Depth3, Depth4])
      );

      expect(defineQuery([ProxyExpand(OwnedByEntity, 4), HasValue(OwnedByEntity, { value: Player })]).get()).toEqual(
        new Set([Depth1, Depth2, Depth3, Depth4, Depth5])
      );

      expect(
        defineQuery([
          ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER),
          HasValue(OwnedByEntity, { value: Player }),
        ]).get()
      ).toEqual(new Set([Depth1, Depth2, Depth3, Depth4, Depth5]));
    });

    it("should return entites owned by an entity with Name component Alice", () => {
      const Player = createEntity(world, [withValue(Name, { name: "Alice" })]);
      const Depth1 = createEntity(world, [withValue(OwnedByEntity, { value: Player })]);
      const Depth2 = createEntity(world, [withValue(OwnedByEntity, { value: Depth1 })]);
      const Depth3 = createEntity(world, [withValue(OwnedByEntity, { value: Depth2 })]);
      const Depth4 = createEntity(world, [withValue(OwnedByEntity, { value: Depth3 })]);

      expect(
        defineQuery(
          [ProxyRead(OwnedByEntity, 1), HasValue(Name, { name: "Alice" })],
          new Set([Depth1, Depth2, Depth3]) // Provide an initial set of entities
        ).get()
      ).toEqual(new Set([Depth1]));

      expect(
        defineQuery([
          ProxyExpand(OwnedByEntity, 1), // Turn on proxy expand
          HasValue(Name, { name: "Alice" }), // Get all entities with name Alice or owned by Alice
          ProxyExpand(OwnedByEntity, 0), // Turn off proxy expand
          NotValue(Name, { name: "Alice" }), // Filter Alice, only keep entities owned by Alice
        ]).get()
      ).toEqual(new Set([Depth1]));

      expect(
        defineQuery([
          ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER), // Include all child entities
          HasValue(Name, { name: "Alice" }), // Get all child entities of Alice (including alice)
          ProxyExpand(OwnedByEntity, 0), // Turn off proxy expand
          NotValue(Name, { name: "Alice" }), // Filter Alice, only keep entities owned by Alice
        ]).get()
      ).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));

      // Get all entities from the initial set [Depth3] that have an indirect owner called Alice
      expect(
        defineQuery(
          [ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })],
          new Set([Depth3]) // Provide an initial set of entities
        ).get()
      ).toEqual(new Set([Depth3]));

      // Get all entities that have an indirect owner called Alice
      expect(
        defineQuery(
          [
            ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER),
            HasValue(Name, { name: "Alice" }),
            ProxyRead(OwnedByEntity, 0),
            NotValue(Name, { name: "Alice" }),
          ],
          new Set([Player, Depth1, Depth2, Depth3, Depth4]) // Provide an initial set of entities
        ).get()
      ).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));

      // Get all entities from the initial set [Depth3] that have an indirect owner called Alice and their direct child
      expect(
        defineQuery(
          [
            ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER),
            ProxyExpand(OwnedByEntity, 1),
            HasValue(Name, { name: "Alice" }),
          ],
          new Set([Depth2]) // Provide an initial set of entities
        ).get()
      ).toEqual(new Set([Depth2, Depth3]));
    });

    it("should return all entities with CanMove component on themselves or their Prototype", () => {
      const proto = createEntity(world, [withValue(Prototype, {}), withValue(CanMove, {})]);

      const instance1 = createEntity(world, [
        withValue(FromPrototype, { value: proto }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      const instance2 = createEntity(world, [
        withValue(FromPrototype, { value: proto }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      expect(defineQuery([ProxyExpand(FromPrototype, 1), Has(CanMove), Not(Prototype)]).get()).toEqual(
        new Set([instance1, instance2])
      );

      expect(defineQuery([Has(Position), ProxyRead(FromPrototype, 1), Has(CanMove)]).get()).toEqual(
        new Set([instance1, instance2])
      );

      expect(defineQuery([ProxyRead(FromPrototype, 1), Has(Position), Has(CanMove)]).get()).toEqual(
        new Set([instance1, instance2])
      );
    });

    it("should return all entities with Position component that can't move", () => {
      const proto = createEntity(world, [withValue(Prototype, {}), withValue(CanMove, {})]);

      createEntity(world, [withValue(FromPrototype, { value: proto }), withValue(Position, { x: 1, y: 1 })]);

      createEntity(world, [withValue(FromPrototype, { value: proto }), withValue(Position, { x: 1, y: 1 })]);

      const entity3 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      expect(defineQuery([ProxyRead(FromPrototype, 1), Has(Position), Not(CanMove)]).get()).toEqual(new Set([entity3]));
    });

    it("should return all movable entities not owned by Alice", () => {
      const Player1 = createEntity(world, [withValue(Name, { name: "Alice" })]);
      const Player2 = createEntity(world, [withValue(Name, { name: "Bob" })]);
      const Proto1 = createEntity(world, [withValue(Prototype, {}), withValue(CanMove, {})]);
      const Proto2 = createEntity(world, [withValue(Prototype, {})]);

      // Instance 1
      createEntity(world, [
        withValue(FromPrototype, { value: Proto1 }),
        withValue(OwnedByEntity, { value: Player1 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      // Instance 2
      createEntity(world, [
        withValue(FromPrototype, { value: Proto2 }),
        withValue(OwnedByEntity, { value: Player1 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      const Instance3 = createEntity(world, [
        withValue(FromPrototype, { value: Proto1 }),
        withValue(OwnedByEntity, { value: Player2 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      // Instance 4
      createEntity(world, [
        withValue(FromPrototype, { value: Proto2 }),
        withValue(OwnedByEntity, { value: Player2 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      // Entity 5
      createEntity(world, [withValue(OwnedByEntity, { value: Player1 }), withValue(Position, { x: 1, y: 1 })]);

      // Entity 6
      createEntity(world, [withValue(OwnedByEntity, { value: Player2 }), withValue(Position, { x: 1, y: 1 })]);

      // Entity 7
      createEntity(world, [
        withValue(CanMove, {}),
        withValue(OwnedByEntity, { value: Player1 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      const Entity8 = createEntity(world, [
        withValue(CanMove, {}),
        withValue(OwnedByEntity, { value: Player2 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      expect(
        defineQuery([
          Has(Position), // All entities with position component...
          ProxyRead(FromPrototype, 1), // ...that on themselves or their prototype...
          Has(CanMove), // ...have the CanMove component...
          ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), // ...and for whose owner holds...
          NotValue(Name, { name: "Alice" }), // ...their name is not Alice
        ]).get()
      ).toEqual(new Set([Instance3, Entity8]));
    });

    it("should be observable", () => {
      let queryRanTimes = 0;
      let valueQueryRanTimes = 0;
      const entity = createEntity(world);
      const query = defineQuery([Has(Position)]);
      const valueQuery = defineQuery([HasValue(Position, { x: 2, y: 2 })]);

      reaction(
        () => query.get(),
        () => {
          queryRanTimes++;
        }
      );

      reaction(
        () => valueQuery.get(),
        () => {
          valueQueryRanTimes++;
        }
      );

      setComponent(Position, entity, { x: 2, y: 3 });
      expect(queryRanTimes).toBe(1);
      expect(valueQueryRanTimes).toBe(1);

      setComponent(Position, entity, { x: 2, y: 2 });
      expect(queryRanTimes).toBe(1);
      expect(valueQueryRanTimes).toBe(2);

      removeComponent(Position, entity);
      expect(queryRanTimes).toBe(2);
      expect(valueQueryRanTimes).toBe(3);
    });
  });

  describe("defineEnterQuery", () => {
    it("should only return newly added entities", () => {
      const enterQuery = defineEnterQuery(world, [Has(CanMove)]);
      const entities: string[] = [];
      runInAction(() => {
        entities.push(createEntity(world, [withValue(CanMove, {})]));
        entities.push(createEntity(world, [withValue(CanMove, {})]));
      });
      const entity3 = createEntity(world);

      expect(enterQuery.get()).toEqual(new Set(entities));

      setComponent(CanMove, entity3, {});
      expect(enterQuery.get()).toEqual(new Set([entity3]));
    });
  });

  describe("defineExitQuery", () => {
    it("should only return removed entities", () => {
      const exitQuery = defineExitQuery(world, [Has(CanMove)]);
      const entity1 = createEntity(world, [withValue(CanMove, {})]);
      const entity2 = createEntity(world);
      setComponent(CanMove, entity2, {});

      expect(exitQuery.get()).toEqual(new Set([]));

      removeComponent(CanMove, entity1);
      expect(exitQuery.get()).toEqual(new Set([entity1]));

      removeComponent(CanMove, entity2);
      expect(exitQuery.get()).toEqual(new Set([entity2]));
    });
  });

  describe("defineUpdateQuery", () => {
    it("should only return the last updated entity", () => {
      const updateQuery = defineUpdateQuery(world, [Has(Position)]);
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);

      expect(updateQuery.get()).toEqual(new Set([entity2]));
      // Should return this entity until the next one is updated
      expect(updateQuery.get()).toEqual(new Set([entity2]));

      setComponent(Position, entity1, { x: 2, y: 3 });
      expect(updateQuery.get()).toEqual(new Set([entity1]));
    });

    it("should not return entities matching the query before the query was defined", () => {
      createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const updateQuery = defineUpdateQuery(world, [Has(Position)]);
      expect(updateQuery.get()).toEqual(new Set([]));

      const entity2 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);
      expect(updateQuery.get()).toEqual(new Set([entity2]));
    });

    it("should return entities matching the query before the query was defined if runOnInit is true", () => {
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 4, y: 2 })]);
      const updateQuery = defineUpdateQuery(world, [Has(Position)], { runOnInit: true });
      expect(updateQuery.get()).toEqual(new Set([entity1, entity2]));

      const entity3 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);
      expect(updateQuery.get()).toEqual(new Set([entity3]));
    });

    it("should work with queries including multiple components", () => {
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const entity2 = createEntity(world, [withValue(Position, { x: 4, y: 2 })]);
      const updateQuery = defineUpdateQuery(world, [Has(Position), Has(CanMove)], { runOnInit: true });
      expect(updateQuery.get()).toEqual(new Set([entity1]));

      setComponent(CanMove, entity2, {});
      expect(updateQuery.get()).toEqual(new Set([entity2]));

      setComponent(Position, entity1, { x: 2, y: 4 });
      expect(updateQuery.get()).toEqual(new Set([entity1]));
    });

    it("should be observable", () => {
      let ranTimes = 0;
      const entity = createEntity(world);
      const updateQuery = defineUpdateQuery(world, [Has(Position)]);

      reaction(
        () => updateQuery.get(),
        () => {
          ranTimes++;
        }
      );

      setComponent(Position, entity, { x: 2, y: 3 });
      expect(ranTimes).toBe(1);

      removeComponent(Position, entity);
      expect(ranTimes).toBe(2);
    });
  });

  describe("defineRxQuery", () => {
    it.todo("Should register the subscription in the world");
  });
});
