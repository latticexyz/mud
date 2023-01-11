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
} from "@latticexyz/recs";
import { useComponentValue } from "./useComponentValue";

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
    const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

    const { result } = renderHook(() => useComponentValue(entity1, Position));

    expect(result.current).toEqual({ x: 1, y: 1 });

    act(() => {
      setComponent(Position, entity1, { x: 0, y: 0 });
    });

    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it.skip("should re-render only when Position changes for entity", () => {
    const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);
    const entity2 = createEntity(world, [withValue(Position, { x: 2, y: 2 })]);

    const { result } = renderHook(() => useComponentValue(entity1, Position));

    expect(result.all.length).toBe(2);
    expect(result.current).toEqual({ x: 1, y: 1 });

    act(() => {
      setComponent(Position, entity2, { x: 0, y: 0 });
    });

    expect(result.all.length).toBe(2);
  });
});
