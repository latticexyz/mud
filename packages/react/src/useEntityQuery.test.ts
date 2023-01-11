import { renderHook, act } from "@testing-library/react-hooks";
import {
  World,
  Type,
  createWorld,
  defineComponent,
  Component,
  createEntity,
  withValue,
  Has,
  setComponent,
} from "@latticexyz/recs";
import { useEntityQuery } from "./useEntityQuery";
import { useMemo } from "react";

describe("useEntityQuery", () => {
  let world: World;
  let Position: Component<{
    x: Type.Number;
    y: Type.Number;
  }>;
  let OwnedBy: Component<{ value: Type.Entity }>;

  beforeEach(() => {
    world = createWorld();
    Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { id: "Position" });
    OwnedBy = defineComponent(world, { value: Type.Entity }, { id: "OwnedBy" });
  });

  it("should find entities with Position component", () => {
    const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);
    const entity2 = createEntity(world, [withValue(Position, { x: 2, y: 2 })]);
    const entity3 = createEntity(world, []);

    const { result } = renderHook(() => useEntityQuery(useMemo(() => [Has(Position)], [])));

    expect(result.current.length).toBe(2);
    expect(result.current).toContain(entity1);
    expect(result.current).toContain(entity2);
    expect(result.current).not.toContain(entity3);
  });

  it("should re-render only when Position changes", () => {
    const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);
    const entity2 = createEntity(world, [withValue(Position, { x: 2, y: 2 })]);
    const entity3 = createEntity(world, []);

    const { result } = renderHook(() => useEntityQuery(useMemo(() => [Has(Position)], [])));

    expect(result.all.length).toBe(2);

    act(() => {
      setComponent(Position, entity2, { x: 0, y: 0 });
    });

    expect(result.all.length).toBe(3);

    act(() => {
      setComponent(OwnedBy, entity2, { value: world.entities[entity1] });
      setComponent(OwnedBy, entity3, { value: world.entities[entity1] });
    });

    expect(result.all.length).toBe(3);

    act(() => {
      setComponent(Position, entity3, { x: 0, y: 0 });
    });

    expect(result.all.length).toBe(4);
  });
});
