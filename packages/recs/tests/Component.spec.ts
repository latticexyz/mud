import { reaction } from "mobx";
import {
  defineComponent,
  setComponent,
  removeComponent,
  getComponentValue,
  hasComponent,
  withValue,
  componentValueEquals,
  getEntitiesWithValue,
  cloneComponent,
  overridableComponent,
} from "../src/Component";
import { Type } from "../src/constants";
import { createEntity } from "../src/Entity";
import { AnyComponent, Entity, World } from "../src/types";
import { setEquals } from "../src/Utils/Equals";
import { createWorld } from "../src/World";

describe("Component", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  it("emit changes to its stream", () => {
    const entity = createEntity(world);
    const component = defineComponent(world, { x: Type.Number, y: Type.Number });

    const mock = jest.fn();
    component.stream$.subscribe(({ entity, value }) => {
      mock(entity, value);
    });

    setComponent(component, entity, { x: 1, y: 2 });
    setComponent(component, entity, { x: 7, y: 2 });
    setComponent(component, entity, { x: 7, y: 2 });
    removeComponent(component, entity);

    expect(mock).toHaveBeenNthCalledWith(1, entity, { x: 1, y: 2 });
    expect(mock).toHaveBeenNthCalledWith(2, entity, { x: 7, y: 2 });
    expect(mock).toHaveBeenNthCalledWith(3, entity, { x: 7, y: 2 });
    expect(mock).toHaveBeenNthCalledWith(4, entity, undefined);
  });

  describe("defineComponent", () => {
    it("should register the component in the world", () => {
      expect(world.components.size).toBe(0);
      defineComponent(world, {});
      expect(world.components.size).toBe(1);
    });
  });

  describe("setComponent", () => {
    let component: AnyComponent;
    let entity: Entity;
    let value: number;

    beforeEach(() => {
      component = defineComponent(world, { value: Type.Number });
      entity = createEntity(world);
      value = 1;
      setComponent(component, entity, { value });
    });

    it("should store the component value", () => {
      expect(component.values.value.get(entity)).toBe(value);
    });

    it("should store the entity", () => {
      expect(component.entities.has(entity)).toBe(true);
    });

    it("should store the component in the entity's component set", () => {
      expect(world.entities.get(entity)?.has(component)).toBe(true);
    });

    it.todo("should store the value array");
  });

  describe("removeComponent", () => {
    let component: AnyComponent;
    let entity: Entity;
    let value: number;

    beforeEach(() => {
      component = defineComponent(world, { value: Type.Number });
      entity = createEntity(world);
      value = 1;
      setComponent(component, entity, { value });
      removeComponent(component, entity);
    });

    it("should remove the component value", () => {
      expect(component.values.value.get(entity)).toBe(undefined);
    });

    it("should remove the entity", () => {
      expect(component.entities.has(entity)).toBe(false);
    });

    it("shouldremove the component from the entity's component set", () => {
      expect(world.entities.get(entity)?.has(component)).toBe(false);
    });
  });

  describe("hasComponent", () => {
    it("should return true if the entity has the component", () => {
      const component = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity = createEntity(world);
      const value = { x: 1, y: 2 };
      setComponent(component, entity, value);

      expect(hasComponent(component, entity)).toEqual(true);
    });
  });

  describe("getComponentValue", () => {
    it("should return the correct component value", () => {
      const component = defineComponent(world, { x: Type.Number, y: Type.Number });
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
    const value1 = { x: 1, y: 2, z: "x" };
    const value2 = { x: 1, y: 2, z: "x" };
    const value3 = { x: "1", y: 2, z: "x" };

    expect(componentValueEquals(value1, value2)).toBe(true);
    expect(componentValueEquals(value2, value3)).toBe(false);
  });

  describe("withValue", () => {
    it("should return a ComponentWithValue", () => {
      const component = defineComponent(world, { x: Type.Number, y: Type.Number });
      const value = { x: 1, y: 2 };
      const componentWithValue = withValue(component, value);
      expect(componentWithValue).toEqual({ component, value });
    });
  });

  describe("getEntitiesWithValue", () => {
    it("Should return all and only entities with this value", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      createEntity(world, [withValue(Position, { x: 2, y: 1 })]);
      createEntity(world);
      const entity4 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);

      expect(setEquals(getEntitiesWithValue(Position, { x: 1, y: 2 }), new Set([entity1, entity4]))).toBe(true);
    });
  });

  describe("cloneComponent", () => {
    it("should return a deep copy of the given component", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const PositionClone = cloneComponent(Position);
      expect(getComponentValue(PositionClone, entity1)).toEqual({ x: 1, y: 2 });
    });

    it("the cloned component should not be updated if the original component is updated", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const PositionClone = cloneComponent(Position);

      setComponent(Position, entity1, { x: 2, y: 2 });
      expect(getComponentValue(PositionClone, entity1)).toEqual({ x: 1, y: 2 });

      const entity2 = createEntity(world, [withValue(Position, { x: 3, y: 3 })]);
      expect(getComponentValue(PositionClone, entity2)).toBeUndefined();
    });

    it("the original component should not be updated if the cloned component is updated", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const PositionClone = cloneComponent(Position);
      setComponent(PositionClone, entity1, { x: 2, y: 2 });
      expect(getComponentValue(PositionClone, entity1)).toEqual({ x: 2, y: 2 });
      expect(getComponentValue(Position, entity1)).toEqual({ x: 1, y: 2 });

      const entity2 = "entity2";
      setComponent(PositionClone, entity2, { x: 3, y: 3 });
      expect(getComponentValue(PositionClone, entity2)).toEqual({ x: 3, y: 3 });
      expect(getComponentValue(Position, entity2)).toBeUndefined();
    });
  });

  describe("overridableComponent", () => {
    it("should return a overridable component", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const OverridablePosition = overridableComponent(Position);
      expect("addOverride" in OverridablePosition).toBe(true);
      expect("addOverride" in OverridablePosition).toBe(true);
    });

    it("should mirror all values of the source component", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const OverridablePosition = overridableComponent(Position);
      expect(getComponentValue(OverridablePosition, entity1)).toEqual({ x: 1, y: 2 });
    });

    it("the overridable component should be updated if the original component is updated", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const OverridableComponent = overridableComponent(Position);

      setComponent(Position, entity1, { x: 2, y: 2 });
      expect(getComponentValue(OverridableComponent, entity1)).toEqual({ x: 2, y: 2 });

      const entity2 = createEntity(world, [withValue(Position, { x: 3, y: 3 })]);
      expect(getComponentValue(OverridableComponent, entity2)).toEqual({ x: 3, y: 3 });
    });

    it("should return the updated component value if there is a relevant update for the given entity", () => {
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
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
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const entity1 = createEntity(world);
      setComponent(Position, entity1, { x: 1, y: 2 });

      const OverridablePosition = overridableComponent(Position);

      const spy = jest.fn();
      reaction(
        () => getComponentValue(OverridablePosition, entity1)?.x,
        () => spy()
      );

      expect(spy).toHaveBeenCalledTimes(0);

      OverridablePosition.addOverride("firstOverride", { entity: entity1, value: { x: 3, y: 3 } });
      expect(spy).toHaveBeenCalledTimes(1);

      OverridablePosition.removeOverride("firstOverride");
      expect(spy).toHaveBeenCalledTimes(2);

      OverridablePosition.addOverride("secondOverride", { entity: "unrelatedEntity", value: { x: 2, y: 3 } });
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});
