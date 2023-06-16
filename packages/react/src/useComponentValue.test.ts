import { renderHook, act } from "@testing-library/react-hooks";
import {
  World,
  Type,
  createWorld,
  defineComponent,
  Component,
  createEntity,
  withValue,
  setComponent,
  removeComponent,
} from "@latticexyz/recs";
import { useComponentValue } from "./useComponentValue";
import { describe, it, expect, beforeEach } from "vitest";

describe("useComponentValue", () => {
  let world: World;
  let Position: Component<{
    x: Type.Number;
    y: Type.Number;
  }>;

  beforeEach(() => {
    world = createWorld();
    Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { id: "Position" });
  });

  it("should return Position value for entity", () => {
    const entity = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

    const { result } = renderHook(() => useComponentValue(Position, entity));
    expect(result.current).toEqual({ x: 1, y: 1 });

    act(() => {
      setComponent(Position, entity, { x: 0, y: 0 });
    });
    expect(result.current).toEqual({ x: 0, y: 0 });

    act(() => {
      removeComponent(Position, entity);
    });
    expect(result.current).toBe(undefined);
  });

  it("should re-render only when Position changes for entity", () => {
    const entity = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);
    const otherEntity = createEntity(world, [withValue(Position, { x: 2, y: 2 })]);

    const { result } = renderHook(() => useComponentValue(Position, entity));
    expect(result.all.length).toBe(2);
    expect(result.current).toEqual({ x: 1, y: 1 });

    act(() => {
      setComponent(Position, entity, { x: 0, y: 0 });
    });
    expect(result.all.length).toBe(3);
    expect(result.current).toEqual({ x: 0, y: 0 });

    act(() => {
      setComponent(Position, otherEntity, { x: 0, y: 0 });
      removeComponent(Position, otherEntity);
    });
    expect(result.all.length).toBe(3);
    expect(result.current).toEqual({ x: 0, y: 0 });

    act(() => {
      removeComponent(Position, entity);
    });
    expect(result.all.length).toBe(4);
    expect(result.current).toBe(undefined);
  });

  it("should return default value when Position is not set", () => {
    const entity = createEntity(world);

    const { result } = renderHook(() => useComponentValue(Position, entity, { x: -1, y: -1 }));
    expect(result.current).toEqual({ x: -1, y: -1 });

    act(() => {
      setComponent(Position, entity, { x: 0, y: 0 });
    });
    expect(result.current).toEqual({ x: 0, y: 0 });

    act(() => {
      removeComponent(Position, entity);
    });
    expect(result.current).toEqual({ x: -1, y: -1 });
  });
});
