import { VoxelCoord } from "./types";
import { transformIterator } from "./iterable";

function coordToKey(coord: VoxelCoord) {
  // TODO: find a more memory efficient way to store these keys
  return `${coord.x}/${coord.y}/${coord.z}`;
}

function keyToCoord(key: string): VoxelCoord {
  const fragments = key.split("/");
  return { x: Number(fragments[0]), y: Number(fragments[1]), z: Number(fragments[2]) };
}

export class VoxelCoordMap<T> {
  map: Map<string, T>;
  defaultValue?: T;

  constructor(props?: { defaultValue?: T }) {
    this.map = new Map<string, T>();
    this.defaultValue = props?.defaultValue;
  }

  static from<T>(coordMapLike: { map: Map<string, T>; defaultValue?: T }): VoxelCoordMap<T> {
    const coordMap = new VoxelCoordMap<T>();
    coordMap.map = coordMapLike.map;
    coordMap.defaultValue = coordMapLike.defaultValue;
    return coordMap;
  }

  set(coord: VoxelCoord, value: T) {
    return this.map.set(coordToKey(coord), value);
  }

  get(coord: VoxelCoord) {
    return this.map.get(coordToKey(coord)) ?? this.defaultValue;
  }

  keys() {
    return this.map.keys();
  }

  coords(): IterableIterator<VoxelCoord> {
    return transformIterator(this.map.keys(), (key) => keyToCoord(key));
  }

  entries() {
    return this.map.entries();
  }

  toArray(): [VoxelCoord, T][] {
    const entries = Array.from(this.map.entries());
    return entries.map(([key, value]) => [keyToCoord(key), value]);
  }

  values() {
    return this.map.values();
  }

  delete(coord: VoxelCoord) {
    return this.map.delete(coordToKey(coord));
  }

  has(coord: VoxelCoord): boolean {
    return this.map.has(coordToKey(coord));
  }

  clear() {
    for (const key of this.map.keys()) {
      this.map.delete(key);
    }
  }

  get size(): number {
    return this.map.size;
  }
}
