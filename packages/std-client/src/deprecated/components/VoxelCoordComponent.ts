import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineVoxelCoordComponent<M extends Metadata>(
  world: World,
  options?: { id?: string; metadata?: M; indexed?: boolean }
) {
  return defineComponent<{ x: Type.Number; y: Type.Number; z: Type.Number }, M>(
    world,
    { x: Type.Number, y: Type.Number, z: Type.Number },
    options
  );
}
