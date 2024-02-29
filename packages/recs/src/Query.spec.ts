import { defineComponent, removeComponent, setComponent, withValue } from "./Component";
import { UpdateType, Type } from "./constants";
import { createEntity } from "./Entity";
import {
  Has,
  Not,
  defineEnterQuery,
  defineExitQuery,
  defineQuery,
  HasValue,
  NotValue,
  ProxyRead,
  ProxyExpand,
  runQuery,
} from "./Query";
import { Component, Entity, World } from "./types";
import { createWorld } from "./World";

describe("Query", () => {
  let world: World;

  let Position: Component<{
    x: Type.Number;
    y: Type.Number;
  }>;

  let CanMove: Component<{ value: Type.Boolean }>;

  let OwnedByEntity: Component<{ value: Type.Entity }>;

  let Prototype: Component<{ value: Type.Boolean }>;

  let FromPrototype: Component<{ value: Type.Entity }>;

  let Name: Component<{ name: Type.String }>;

  beforeEach(() => {
    world = createWorld();

    Position = defineComponent(world, { x: Type.Number, y: Type.Number });
    CanMove = defineComponent(world, { value: Type.Boolean });
    Name = defineComponent(world, { name: Type.String }, { id: "Name" });
    OwnedByEntity = defineComponent(world, { value: Type.Entity }, { id: "OwnedByEntity" });
    Prototype = defineComponent(world, { value: Type.Boolean });
    FromPrototype = defineComponent(world, { value: Type.Entity });
  });

  describe("runQuery", () => {
    it("should return all entities with Position and CanMove component", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, { value: true })]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, { value: true })]);
      const Structure = createEntity(world, [withValue(Position, { x: 2, y: 3 })]);

      const movableEntities = runQuery([Has(CanMove), Has(Position)]);
      const staticEntities = runQuery([Has(Position), Not(CanMove)]);

      expect(movableEntities).toEqual(new Set([Creature1, Creature2]));
      expect(movableEntities.has(Structure)).toBe(false);

      expect(staticEntities).toEqual(new Set([Structure]));
    });

    it("should return all entities with the given values for the Position component", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, { value: true })]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, { value: true })]);
      const Creature3 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      const valueQuery1 = runQuery([HasValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery1).toEqual(new Set([Creature2, Creature3]));

      const valueQuery2 = runQuery([Has(CanMove), HasValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery2).toEqual(new Set([Creature2]));

      const valueQuery3 = runQuery([Has(CanMove), HasValue(Position, { x: 1, y: 2 })]);
      expect(valueQuery3).toEqual(new Set([Creature1]));
    });

    it("should return all entities with Position component except of a specific value", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, { value: true })]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, { value: true })]);
      const Creature3 = createEntity(world, [withValue(Position, { x: 2, y: 1 })]);

      const valueQuery1 = runQuery([Has(Position), NotValue(Position, { x: 1, y: 2 })]);
      expect(valueQuery1).toEqual(new Set([Creature2, Creature3]));

      const valueQuery2 = runQuery([Has(CanMove), NotValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery2).toEqual(new Set([Creature1]));
    });

    it("should return all player owned entities up to the given depth", () => {
      const Player = createEntity(world);
      const Depth1 = createEntity(world, [withValue(OwnedByEntity, { value: Player })]);
      const Depth2 = createEntity(world, [withValue(OwnedByEntity, { value: Depth1 })]);
      const Depth3 = createEntity(world, [withValue(OwnedByEntity, { value: Depth2 })]);
      const Depth4 = createEntity(world, [withValue(OwnedByEntity, { value: Depth3 })]);
      const Depth5 = createEntity(world, [withValue(OwnedByEntity, { value: Depth4 })]);

      expect(runQuery([HasValue(OwnedByEntity, { value: Player })])).toEqual(new Set([Depth1]));

      expect(runQuery([ProxyExpand(OwnedByEntity, 0), HasValue(OwnedByEntity, { value: Player })])).toEqual(
        new Set([Depth1])
      );

      expect(runQuery([ProxyExpand(OwnedByEntity, 1), HasValue(OwnedByEntity, { value: Player })])).toEqual(
        new Set([Depth1, Depth2])
      );

      expect(runQuery([ProxyExpand(OwnedByEntity, 2), HasValue(OwnedByEntity, { value: Player })])).toEqual(
        new Set([Depth1, Depth2, Depth3])
      );

      expect(runQuery([ProxyExpand(OwnedByEntity, 3), HasValue(OwnedByEntity, { value: Player })])).toEqual(
        new Set([Depth1, Depth2, Depth3, Depth4])
      );

      expect(runQuery([ProxyExpand(OwnedByEntity, 4), HasValue(OwnedByEntity, { value: Player })])).toEqual(
        new Set([Depth1, Depth2, Depth3, Depth4, Depth5])
      );

      expect(
        runQuery([ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(OwnedByEntity, { value: Player })])
      ).toEqual(new Set([Depth1, Depth2, Depth3, Depth4, Depth5]));
    });

    it("should return entites owned by an entity with Name component Alice", () => {
      const Player = createEntity(world, [withValue(Name, { name: "Alice" })]);
      const Depth1 = createEntity(world, [withValue(OwnedByEntity, { value: Player })]);
      const Depth2 = createEntity(world, [withValue(OwnedByEntity, { value: Depth1 })]);
      const Depth3 = createEntity(world, [withValue(OwnedByEntity, { value: Depth2 })]);
      const Depth4 = createEntity(world, [withValue(OwnedByEntity, { value: Depth3 })]);

      expect(
        runQuery(
          [ProxyRead(OwnedByEntity, 1), HasValue(Name, { name: "Alice" })],
          new Set([Depth1, Depth2, Depth3]) // Provide an initial set of entities
        )
      ).toEqual(new Set([Depth1]));

      expect(
        runQuery([
          ProxyExpand(OwnedByEntity, 1), // Turn on proxy expand
          HasValue(Name, { name: "Alice" }), // Get all entities with name Alice or owned by Alice
          ProxyExpand(OwnedByEntity, 0), // Turn off proxy expand
          NotValue(Name, { name: "Alice" }), // Filter Alice, only keep entities owned by Alice
        ])
      ).toEqual(new Set([Depth1]));

      expect(
        runQuery([
          ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER), // Include all child entities
          HasValue(Name, { name: "Alice" }), // Get all child entities of Alice (including alice)
          ProxyExpand(OwnedByEntity, 0), // Turn off proxy expand
          NotValue(Name, { name: "Alice" }), // Filter Alice, only keep entities owned by Alice
        ])
      ).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));

      // Get all entities from the initial set [Depth3] that have an indirect owner called Alice
      expect(
        runQuery(
          [ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })],
          new Set([Depth3]) // Provide an initial set of entities
        )
      ).toEqual(new Set([Depth3]));

      // Get all entities that have an indirect owner called Alice
      expect(
        runQuery(
          [
            ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER),
            HasValue(Name, { name: "Alice" }),
            ProxyRead(OwnedByEntity, 0),
            NotValue(Name, { name: "Alice" }),
          ],
          new Set([Player, Depth1, Depth2, Depth3, Depth4]) // Provide an initial set of entities
        )
      ).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));

      // Get all entities from the initial set [Depth3] that have an indirect owner called Alice and their direct child
      expect(
        runQuery(
          [
            ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER),
            ProxyExpand(OwnedByEntity, 1),
            HasValue(Name, { name: "Alice" }),
          ],
          new Set([Depth2]) // Provide an initial set of entities
        )
      ).toEqual(new Set([Depth2, Depth3]));
    });

    it("should return all entities with CanMove component on themselves or their Prototype", () => {
      const proto = createEntity(world, [withValue(Prototype, { value: true }), withValue(CanMove, { value: true })]);

      const instance1 = createEntity(world, [
        withValue(FromPrototype, { value: proto }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      const instance2 = createEntity(world, [
        withValue(FromPrototype, { value: proto }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      expect(runQuery([ProxyExpand(FromPrototype, 1), Has(CanMove), Not(Prototype)])).toEqual(
        new Set([instance1, instance2])
      );

      expect(runQuery([Has(Position), ProxyRead(FromPrototype, 1), Has(CanMove)])).toEqual(
        new Set([instance1, instance2])
      );

      expect(runQuery([ProxyRead(FromPrototype, 1), Has(Position), Has(CanMove)])).toEqual(
        new Set([instance1, instance2])
      );
    });

    it("should return all entities with Position component that can't move", () => {
      const proto = createEntity(world, [withValue(Prototype, { value: true }), withValue(CanMove, { value: true })]);

      createEntity(world, [withValue(FromPrototype, { value: proto }), withValue(Position, { x: 1, y: 1 })]);

      createEntity(world, [withValue(FromPrototype, { value: proto }), withValue(Position, { x: 1, y: 1 })]);

      const entity3 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      expect(runQuery([ProxyRead(FromPrototype, 1), Has(Position), Not(CanMove)])).toEqual(new Set([entity3]));
    });

    it("should return all movable entities not owned by Alice", () => {
      const Player1 = createEntity(world, [withValue(Name, { name: "Alice" })]);
      const Player2 = createEntity(world, [withValue(Name, { name: "Bob" })]);
      const Proto1 = createEntity(world, [withValue(Prototype, { value: true }), withValue(CanMove, { value: true })]);
      const Proto2 = createEntity(world, [withValue(Prototype, { value: true })]);

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
        withValue(CanMove, { value: true }),
        withValue(OwnedByEntity, { value: Player1 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      const Entity8 = createEntity(world, [
        withValue(CanMove, { value: true }),
        withValue(OwnedByEntity, { value: Player2 }),
        withValue(Position, { x: 1, y: 1 }),
      ]);

      expect(
        runQuery([
          Has(Position), // All entities with position component...
          ProxyRead(FromPrototype, 1), // ...that on themselves or their prototype...
          Has(CanMove), // ...have the CanMove component...
          ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), // ...and for whose owner holds...
          NotValue(Name, { name: "Alice" }), // ...their name is not Alice
        ])
      ).toEqual(new Set([Instance3, Entity8]));
    });

    // it("should be observable", () => {
    //   let queryRanTimes = 0;
    //   let valueQueryRanTimes = 0;
    //   const entity = createEntity(world);
    //   const query = runQuery([Has(Position)]);
    //   const valueQuery = runQuery([HasValue(Position, { x: 2, y: 2 })]);

    //   reaction(
    //     () => query.get(),
    //     () => {
    //       queryRanTimes++;
    //     }
    //   );

    //   reaction(
    //     () => valueQuery.get(),
    //     () => {
    //       valueQueryRanTimes++;
    //     }
    //   );

    //   setComponent(Position, entity, { x: 2, y: 3 });
    //   expect(queryRanTimes).toBe(1);
    //   expect(valueQueryRanTimes).toBe(1);

    //   setComponent(Position, entity, { x: 2, y: 2 });
    //   expect(queryRanTimes).toBe(1);
    //   expect(valueQueryRanTimes).toBe(2);

    //   removeComponent(Position, entity);
    //   expect(queryRanTimes).toBe(2);
    //   expect(valueQueryRanTimes).toBe(3);
    // });
  });

  describe("defineEnterQuery", () => {
    it("should only return newly added entities", () => {
      const enterQuery = defineEnterQuery([Has(CanMove)]);
      const entities: Entity[] = [];

      const mock = jest.fn();
      enterQuery.subscribe(mock);

      entities.push(createEntity(world, [withValue(CanMove, { value: true })]));
      entities.push(createEntity(world, [withValue(CanMove, { value: true })]));
      entities.push(createEntity(world));

      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: entities[0],
          component: CanMove,
          value: [{ value: true }, undefined],
        })
      );
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: entities[1],
          component: CanMove,
          value: [{ value: true }, undefined],
        })
      );
      expect(mock).toBeCalledTimes(2);

      setComponent(CanMove, entities[2], { value: true });
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: entities[2],
          component: CanMove,
          value: [{ value: true }, undefined],
        })
      );
      expect(mock).toHaveBeenCalledTimes(3);
    });
  });

  describe("defineExitQuery", () => {
    it("should only return removed entities", () => {
      const exitQuery = defineExitQuery([Has(CanMove)]);

      const mock = jest.fn();
      exitQuery.subscribe(mock);

      const entity1 = createEntity(world, [withValue(CanMove, { value: true })]);
      const entity2 = createEntity(world);

      setComponent(CanMove, entity2, { value: true });

      expect(mock).toHaveBeenCalledTimes(0);

      removeComponent(CanMove, entity1);
      expect(mock).toHaveBeenCalledTimes(1);

      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: entity1,
          component: CanMove,
          value: [undefined, { value: true }],
        })
      );

      removeComponent(CanMove, entity2);
      expect(mock).toHaveBeenCalledTimes(2);
      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: entity2,
          component: CanMove,
          value: [undefined, { value: true }],
        })
      );
    });
  });

  describe("defineUpdateQuery", () => {
    it("should only return the last updated entity", () => {
      const updateQuery = defineQuery([Has(Position)]);

      const mock = jest.fn();
      updateQuery.update$.subscribe(mock);

      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);

      expect(mock).toHaveBeenCalledTimes(2);

      expect(mock).toHaveBeenCalledWith({
        entity: entity1,
        value: [{ x: 1, y: 2 }, undefined],
        component: Position,
        type: UpdateType.Enter,
      });

      expect(mock).toHaveBeenCalledWith({
        entity: entity2,
        value: [{ x: 1, y: 3 }, undefined],
        component: Position,
        type: UpdateType.Enter,
      });

      setComponent(Position, entity1, { x: 2, y: 3 });

      expect(mock).toHaveBeenCalledWith({
        entity: entity1,
        value: [
          { x: 2, y: 3 },
          { x: 1, y: 2 },
        ],
        component: Position,
        type: UpdateType.Update,
      });

      expect(mock).toHaveBeenCalledTimes(3);

      removeComponent(Position, entity1);

      expect(mock).toHaveBeenCalledWith({
        entity: entity1,
        value: [undefined, { x: 2, y: 3 }],
        component: Position,
        type: UpdateType.Exit,
      });

      expect(mock).toHaveBeenCalledTimes(4);
    });

    it("should not return entities matching the query before the query was subscribed to if runOnInit is undefined/false", () => {
      const updateQuery = defineQuery([Has(Position)]);
      const entity = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);

      const mock = jest.fn();
      updateQuery.update$.subscribe(mock);

      expect(mock).not.toHaveBeenCalled();

      setComponent(Position, entity, { x: 1, y: 3 });

      expect(mock).toHaveBeenCalledWith({
        entity,
        value: [
          { x: 1, y: 3 },
          { x: 1, y: 2 },
        ],
        component: Position,
        type: UpdateType.Enter,
      });

      expect(mock).toHaveBeenCalledTimes(1);
    });

    // it("should return entities matching the query before the query was defined if runOnInit is true", () => {
    //   const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
    //   const entity2 = createEntity(world, [withValue(Position, { x: 4, y: 2 })]);
    //   const updateQuery = defineUpdateQuery([Has(Position)], { runOnInit: true });

    //   const mock = jest.fn();
    //   updateQuery.update$.subscribe(mock);

    //   expect(mock).toHaveBeenNthCalledWith(1, {
    //     entity: entity1,
    //     value: [{ x: 1, y: 2 }, undefined],
    //     component: Position,
    //     type: QueryUpdate.Enter,
    //   });

    //   expect(mock).toHaveBeenNthCalledWith(2, {
    //     entity: entity2,
    //     value: [{ x: 4, y: 2 }, undefined],
    //     component: Position,
    //     type: QueryUpdate.Enter,
    //   });

    //   expect(mock).toHaveBeenCalledTimes(2);

    //   const entity3 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);

    //   expect(mock).toHaveBeenNthCalledWith(3, {
    //     entity: entity3,
    //     value: [{ x: 1, y: 3 }, undefined],
    //     component: Position,
    //     type: QueryUpdate.Enter,
    //   });

    //   expect(mock).toHaveBeenCalledTimes(3);
    // });

    it("should work with queries including multiple components", () => {
      const updateQuery = defineQuery([Has(Position), Has(CanMove)]);

      const mock = jest.fn();
      updateQuery.update$.subscribe(mock);

      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, { value: true })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 4, y: 2 })]);

      expect(mock).toHaveBeenCalledTimes(1);

      expect(mock).toHaveBeenNthCalledWith(1, {
        entity: entity1,
        value: [{ value: true }, undefined],
        component: CanMove,
        type: UpdateType.Enter,
      });

      setComponent(CanMove, entity2, { value: true });

      expect(mock).toHaveBeenCalledTimes(2);

      expect(mock).toHaveBeenNthCalledWith(2, {
        entity: entity2,
        value: [{ value: true }, undefined],
        component: CanMove,
        type: UpdateType.Enter,
      });

      setComponent(Position, entity1, { x: 2, y: 4 });

      expect(mock).toHaveBeenCalledTimes(3);

      expect(mock).toHaveBeenNthCalledWith(3, {
        entity: entity1,
        value: [
          { x: 2, y: 4 },
          { x: 1, y: 2 },
        ],
        component: Position,
        type: UpdateType.Update,
      });
    });
  });

  describe("defineQuery", () => {
    it("should return all player owned entities up to the given depth", () => {
      const Player = createEntity(world);
      const Depth1 = createEntity(world);
      const Depth2 = createEntity(world);
      const Depth3 = createEntity(world);
      const Depth4 = createEntity(world);
      const Depth5 = createEntity(world);

      const query1 = defineQuery([HasValue(OwnedByEntity, { value: Player })]);
      query1.update$.subscribe();

      const query2 = defineQuery([ProxyExpand(OwnedByEntity, 0), HasValue(OwnedByEntity, { value: Player })]);
      query2.update$.subscribe();

      const query3 = defineQuery([ProxyExpand(OwnedByEntity, 1), HasValue(OwnedByEntity, { value: Player })]);
      query3.update$.subscribe();

      const query4 = defineQuery([ProxyExpand(OwnedByEntity, 2), HasValue(OwnedByEntity, { value: Player })]);
      query4.update$.subscribe();

      const query5 = defineQuery([ProxyExpand(OwnedByEntity, 3), HasValue(OwnedByEntity, { value: Player })]);
      query5.update$.subscribe();

      const query6 = defineQuery([ProxyExpand(OwnedByEntity, 4), HasValue(OwnedByEntity, { value: Player })]);
      query6.update$.subscribe();

      const query7 = defineQuery([
        ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER),
        HasValue(OwnedByEntity, { value: Player }),
      ]);
      query7.update$.subscribe();

      setComponent(OwnedByEntity, Depth1, { value: Player });
      setComponent(OwnedByEntity, Depth2, { value: Depth1 });
      setComponent(OwnedByEntity, Depth3, { value: Depth2 });
      setComponent(OwnedByEntity, Depth4, { value: Depth3 });
      setComponent(OwnedByEntity, Depth5, { value: Depth4 });

      expect(new Set([...query1.matching])).toEqual(new Set([Depth1]));
      expect(new Set([...query2.matching])).toEqual(new Set([Depth1]));
      expect(new Set([...query3.matching])).toEqual(new Set([Depth1, Depth2]));
      expect(new Set([...query4.matching])).toEqual(new Set([Depth1, Depth2, Depth3]));
      expect(new Set([...query5.matching])).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));
      expect(new Set([...query6.matching])).toEqual(new Set([Depth1, Depth2, Depth3, Depth4, Depth5]));
      expect(new Set([...query7.matching])).toEqual(new Set([Depth1, Depth2, Depth3, Depth4, Depth5]));
    });

    it("should return entites owned by an entity with Name component Alice", () => {
      const Player = createEntity(world);
      const Depth1 = createEntity(world);
      const Depth2 = createEntity(world);
      const Depth3 = createEntity(world);
      const Depth4 = createEntity(world);

      const query1 = defineQuery(
        [ProxyRead(OwnedByEntity, 1), HasValue(Name, { name: "Alice" })],
        { initialSet: new Set([Depth1, Depth2, Depth3]) } // Provide an initial set of entities
      );
      query1.update$.subscribe();

      const query2 = defineQuery([
        ProxyExpand(OwnedByEntity, 1), // Turn on proxy expand
        HasValue(Name, { name: "Alice" }), // Get all entities with name Alice or owned by Alice
        ProxyExpand(OwnedByEntity, 0), // Turn off proxy expand
        NotValue(Name, { name: "Alice" }), // Filter Alice, only keep entities owned by Alice
      ]);
      query2.update$.subscribe();

      const query3 = defineQuery([
        ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER), // Include all child entities
        HasValue(Name, { name: "Alice" }), // Get all child entities of Alice (including alice)
        ProxyExpand(OwnedByEntity, 0), // Turn off proxy expand
        NotValue(Name, { name: "Alice" }), // Filter Alice, only keep entities owned by Alice
      ]);
      query3.update$.subscribe();

      const query4 = defineQuery(
        [ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })],
        { initialSet: new Set([Depth3]) } // Provide an initial set of entities
      );
      query4.update$.subscribe();

      const query5 = defineQuery(
        [
          ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER),
          HasValue(Name, { name: "Alice" }),
          ProxyRead(OwnedByEntity, 0),
          NotValue(Name, { name: "Alice" }),
        ],
        { initialSet: new Set([Player, Depth1, Depth2, Depth3, Depth4]) } // Provide an initial set of entities
      );
      query5.update$.subscribe();

      const query6 = defineQuery(
        [
          ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER),
          ProxyExpand(OwnedByEntity, 1),
          HasValue(Name, { name: "Alice" }),
        ],
        { initialSet: new Set([Depth2]) } // Provide an initial set of entities
      );
      query6.update$.subscribe();

      setComponent(Name, Player, { name: "Alice" });
      setComponent(OwnedByEntity, Depth1, { value: Player });
      setComponent(OwnedByEntity, Depth2, { value: Depth1 });
      setComponent(OwnedByEntity, Depth3, { value: Depth2 });
      setComponent(OwnedByEntity, Depth4, { value: Depth3 });

      expect(new Set([...query1.matching])).toEqual(new Set([Depth1]));
      expect(new Set([...query2.matching])).toEqual(new Set([Depth1]));
      expect(new Set([...query3.matching])).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));

      // Get all entities from the initial set [Depth3] that have an indirect owner called Alice
      expect(new Set([...query4.matching])).toEqual(new Set([Depth3]));

      // Get all entities that have an indirect owner called Alice
      expect(new Set([...query5.matching])).toEqual(new Set([Depth1, Depth2, Depth3, Depth4]));

      // Get all entities from the initial set [Depth3] that have an indirect owner called Alice and their direct child
      expect(new Set([...query6.matching])).toEqual(new Set([Depth2, Depth3]));
    });

    it("should return all entities with CanMove component on themselves or their Prototype", () => {
      const proto = createEntity(world);

      const instance1 = createEntity(world);
      const instance2 = createEntity(world);

      const instance3 = createEntity(world);

      const query1 = defineQuery([ProxyExpand(FromPrototype, 1), Has(CanMove), Not(Prototype)]);
      query1.update$.subscribe();
      const query2 = defineQuery([Has(Position), ProxyRead(FromPrototype, 1), Has(CanMove)]);
      query2.update$.subscribe();
      const query3 = defineQuery([ProxyRead(FromPrototype, 1), Has(Position), Has(CanMove)]);
      query3.update$.subscribe();

      setComponent(Prototype, proto, { value: true });
      setComponent(CanMove, proto, { value: true });

      setComponent(FromPrototype, instance1, { value: proto });
      setComponent(Position, instance1, { x: 1, y: 1 });

      setComponent(FromPrototype, instance2, { value: proto });
      setComponent(Position, instance2, { x: 1, y: 1 });

      setComponent(Position, instance3, { x: 1, y: 1 });

      expect(new Set([...query1.matching])).toEqual(new Set([instance1, instance2]));
      expect(new Set([...query2.matching])).toEqual(new Set([instance1, instance2]));
      expect(new Set([...query3.matching])).toEqual(new Set([instance1, instance2]));
    });

    it("should return all entities with Position component that can't move", () => {
      const proto = createEntity(world);
      const entity1 = createEntity(world);
      const entity2 = createEntity(world);
      const entity3 = createEntity(world);

      const query = defineQuery([ProxyRead(FromPrototype, 1), Has(Position), Not(CanMove)]);
      query.update$.subscribe();

      setComponent(Prototype, proto, { value: true });
      setComponent(CanMove, proto, { value: true });

      setComponent(FromPrototype, entity1, { value: proto });
      setComponent(Position, entity1, { x: 1, y: 1 });

      setComponent(FromPrototype, entity2, { value: proto });
      setComponent(Position, entity2, { x: 1, y: 1 });

      setComponent(Position, entity3, { x: 1, y: 1 });

      expect(new Set([...query.matching])).toEqual(new Set([entity3]));
    });

    it("should return all movable entities not owned by Alice", () => {
      const Player1 = createEntity(world);
      const Player2 = createEntity(world);
      const Proto1 = createEntity(world);
      const Proto2 = createEntity(world);
      const Instance1 = createEntity(world);
      const Instance2 = createEntity(world);
      const Instance3 = createEntity(world);
      const Instance4 = createEntity(world);
      const Entity5 = createEntity(world);
      const Entity6 = createEntity(world);
      const Entity7 = createEntity(world);
      const Entity8 = createEntity(world);

      const query = defineQuery([
        Has(Position), // All entities with position component...
        ProxyRead(FromPrototype, 1), // ...that on themselves or their prototype...
        Has(CanMove), // ...have the CanMove component...
        ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), // ...and for whose owner holds...
        NotValue(Name, { name: "Alice" }), // ...their name is not Alice
      ]);
      query.update$.subscribe();

      setComponent(Name, Player1, { name: "Alice" });
      setComponent(Name, Player2, { name: "Bob" });
      setComponent(Prototype, Proto1, { value: true });
      setComponent(CanMove, Proto1, { value: true });
      setComponent(Prototype, Proto2, { value: true });

      // Instance 1
      setComponent(FromPrototype, Instance1, { value: Proto1 });
      setComponent(OwnedByEntity, Instance1, { value: Player1 });
      setComponent(Position, Instance1, { x: 1, y: 1 });

      // Instance 2
      setComponent(FromPrototype, Instance2, { value: Proto2 });
      setComponent(OwnedByEntity, Instance2, { value: Player1 });
      setComponent(Position, Instance2, { x: 1, y: 1 });

      // Instance 3
      setComponent(FromPrototype, Instance3, { value: Proto1 });
      setComponent(OwnedByEntity, Instance3, { value: Player2 });
      setComponent(Position, Instance3, { x: 1, y: 1 });

      // Instance 4
      setComponent(FromPrototype, Instance4, { value: Proto2 });
      setComponent(OwnedByEntity, Instance4, { value: Player2 });
      setComponent(Position, Instance4, { x: 1, y: 1 });

      // Entity 5
      setComponent(OwnedByEntity, Entity5, { value: Player1 });
      setComponent(Position, Entity5, { x: 1, y: 1 });

      // Entity 6
      setComponent(OwnedByEntity, Entity6, { value: Player2 });
      setComponent(Position, Entity6, { x: 1, y: 1 });

      // Entity 7
      setComponent(CanMove, Entity7, { value: true });
      setComponent(OwnedByEntity, Entity7, { value: Player1 });
      setComponent(Position, Entity7, { x: 1, y: 1 });

      // Entity 8
      setComponent(CanMove, Entity8, { value: true });
      setComponent(OwnedByEntity, Entity8, { value: Player2 });
      setComponent(Position, Entity8, { x: 1, y: 1 });

      expect(new Set([...query.matching])).toEqual(new Set([Instance3, Entity8]));
    });
  });
});
