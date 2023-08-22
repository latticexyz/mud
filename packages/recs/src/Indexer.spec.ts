import {
  defineComponent,
  setComponent,
  removeComponent,
  getComponentValue,
  hasComponent,
  withValue,
  componentValueEquals,
  getEntitiesWithValue,
  overridableComponent,
} from "../src/Component";
import { createIndexer } from "../src/Indexer";
import { Type } from "../src/constants";
import { createEntity, getEntitySymbol } from "../src/Entity";
import { AnyComponent, Entity, World } from "../src/types";
import { createWorld } from "../src/World";

describe("Indexer", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  it("emit changes to its stream", () => {
    const entity = createEntity(world);
    const component = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });

    const mock = jest.fn();
    component.update$.subscribe((update) => {
      mock(update);
    });

    setComponent(component, entity, { x: 1, y: 2 });
    setComponent(component, entity, { x: 7, y: 2 });
    setComponent(component, entity, { x: 7, y: 2 });
    removeComponent(component, entity);

    expect(mock).toHaveBeenNthCalledWith(1, { entity, value: [{ x: 1, y: 2 }, undefined], component });
    expect(mock).toHaveBeenNthCalledWith(2, {
      entity,
      component,
      value: [
        { x: 7, y: 2 },
        { x: 1, y: 2 },
      ],
    });
    expect(mock).toHaveBeenNthCalledWith(3, {
      entity,
      component,
      value: [
        { x: 7, y: 2 },
        { x: 7, y: 2 },
      ],
    });
    expect(mock).toHaveBeenNthCalledWith(4, { entity, component, value: [undefined, { x: 7, y: 2 }] });
  });

  describe("setComponent", () => {
    let component: AnyComponent;
    let entity: Entity;
    let value: number;

    beforeEach(() => {
      component = defineComponent(world, { value: Type.Number }, { indexed: true });
      entity = createEntity(world);
      value = 1;
      setComponent(component, entity, { value });
    });

    it("should store the component value", () => {
      expect(component.values.value.get(getEntitySymbol(entity))).toBe(value);
    });

    it("should store the entity", () => {
      expect(hasComponent(component, entity)).toBe(true);
    });

    it.todo("should store the value array");
  });

  describe("removeComponent", () => {
    let component: AnyComponent;
    let entity: Entity;
    let value: number;

    beforeEach(() => {
      component = defineComponent(world, { value: Type.Number }, { indexed: true });
      entity = createEntity(world);
      value = 1;
      setComponent(component, entity, { value });
      removeComponent(component, entity);
    });

    it("should remove the component value", () => {
      expect(component.values.value.get(getEntitySymbol(entity))).toBe(undefined);
    });

    it("should remove the entity", () => {
      expect(hasComponent(component, entity)).toBe(false);
    });

    // it("shouldremove the component from the entity's component set", () => {
    //   expect(world.entities.get(entity)?.has(component)).toBe(false);
    // });
  });

  describe("hasComponent", () => {
    it("should return true if the entity has the component", () => {
      const component = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity = createEntity(world);
      const value = { x: 1, y: 2 };
      setComponent(component, entity, value);

      expect(hasComponent(component, entity)).toEqual(true);
    });
  });

  describe("getComponentValue", () => {
    it("should return the correct component value", () => {
      const component = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity = createEntity(world);
      const value = { x: 1, y: 2 };
      setComponent(component, entity, value);

      const receivedValue = getComponentValue(component, entity);
      expect(receivedValue).toEqual(value);
    });
  });

  describe("getComponentValueStrict", () => {
    it.todo("should return the correct component value");
    it.todo("should error if the component value does not exist");
  });

  describe("componentValueEquals", () => {
    it("values should equal equal values", () => {
      const value1 = { x: 1, y: 2, z: "x" };
      const value2 = { x: 1, y: 2, z: "x" };
      const value3 = { x: "1", y: 2, z: "x" };

      expect(componentValueEquals(value1, value2)).toBe(true);
      expect(componentValueEquals(value2, value3)).toBe(false);
    });
  });

  describe("withValue", () => {
    it("should return a ComponentWithValue", () => {
      const component = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const value = { x: 1, y: 2 };
      const componentWithValue = withValue(component, value);
      expect(componentWithValue).toEqual([component, value]);
    });
  });

  describe("getEntitiesWithValue", () => {
    it("Should return all and only entities with this value", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      createEntity(world, [withValue(Position, { x: 2, y: 1 })]);
      createEntity(world);
      const entity4 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);

      expect(getEntitiesWithValue(Position, { x: 1, y: 2 })).toEqual(new Set([entity1, entity4]));
    });

    it("Should keep the entities with value up to date", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 2, y: 1 })]);
      createEntity(world);
      const PositionIndexer = createIndexer(Position);
      expect(getEntitiesWithValue(PositionIndexer, { x: 1, y: 2 })).toEqual(new Set([entity1]));

      const entity3 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      expect(getEntitiesWithValue(PositionIndexer, { x: 1, y: 2 })).toEqual(new Set([entity1, entity3]));

      setComponent(Position, entity2, { x: 1, y: 2 });
      expect(getEntitiesWithValue(PositionIndexer, { x: 1, y: 2 })).toEqual(new Set([entity1, entity2, entity3]));

      setComponent(PositionIndexer, entity1, { x: 2, y: 2 });
      expect(getEntitiesWithValue(PositionIndexer, { x: 1, y: 2 })).toEqual(new Set([entity2, entity3]));
    });
  });

  describe("overridableComponent", () => {
    it("should return a overridable component", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const OverridablePosition = overridableComponent(Position);
      expect("addOverride" in OverridablePosition).toBe(true);
      expect("addOverride" in OverridablePosition).toBe(true);
    });

    it("should mirror all values of the source component", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const OverridablePosition = overridableComponent(Position);
      expect(getComponentValue(OverridablePosition, entity1)).toEqual({ x: 1, y: 2 });
    });

    it("the overridable component should be updated if the original component is updated", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const OverridableComponent = overridableComponent(Position);

      setComponent(Position, entity1, { x: 2, y: 2 });
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 2, y: 2 });

      const entity2 = createEntity(world, [withValue(Position, { x: 3, y: 3 })]);
      expect(getComponentValue(OverridableComponent, entity2)).toEqual({ x: 3, y: 3 });
    });

    it("should return the updated component value if there is a relevant update for the given entity", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity1 = createEntity(world);
      const entity2 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });
      setComponent(Position, entity2, { x: 5, y: 6 });

      const OverridableComponent = overridableComponent(Position);
      OverridableComponent.addOverride("firstOverride", { entity: entity1, value: { x: 2, y: 3 } });
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 2, y: 3 });
      expect(getComponentValue(OverridableComponent, entity2)).toEqual({ x: 5, y: 6 });

      OverridableComponent.addOverride("secondOverride", { entity: entity1, value: { x: 3, y: 3 } });
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 3, y: 3 });

      OverridableComponent.removeOverride("secondOverride");
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 2, y: 3 });

      setComponent(Position, entity1, { x: 10, y: 20 });
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 2, y: 3 });

      OverridableComponent.removeOverride("firstOverride");
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 10, y: 20 });
    });

    it("adding an override should trigger reactions depending on the getComponentValue of the overriden component", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { indexed: true });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const OverridablePosition = overridableComponent(Position);

      const spy = jest.fn();
      OverridablePosition.update$.subscribe(spy);

      expect(spy).toHaveBeenCalledTimes(0);

      OverridablePosition.addOverride("firstOverride", { entity: entity1, value: { x: 3, y: 3 } });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith({
        entity: entity1,
        component: OverridablePosition,
        value: [
          { x: 3, y: 3 },
          { x: 1, y: 2 },
        ],
      });

      OverridablePosition.removeOverride("firstOverride");
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith({
        entity: entity1,
        component: OverridablePosition,
        value: [
          { x: 1, y: 2 },
          { x: 3, y: 3 },
        ],
      });

      OverridablePosition.addOverride("secondOverride", {
        entity: "42" as Entity,
        value: { x: 2, y: 3 },
      });
      expect(spy).toHaveBeenLastCalledWith({
        entity: "42" as Entity,
        component: OverridablePosition,
        value: [{ x: 2, y: 3 }, undefined],
      });
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });
});
