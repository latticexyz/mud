import { WorldCoord } from "../types";
import { transformIterator } from "@mudkit/utils";

const LOWER_HALF_MASK = 2 ** 16 - 1;
const MAX_SUPPORTED = 2 ** 15 - 1;

export function subtract(from: CoordMap<boolean>, subtract: CoordMap<boolean>): CoordMap<boolean> {
  const result = new CoordMap<boolean>();

  for (const coord of from.coords()) {
    if (subtract.get(coord)) continue;
    result.set(coord, true);
  }

  return result;
}

export function coordToKey(coord: WorldCoord) {
  const key = (coord.x << 16) | (coord.y & LOWER_HALF_MASK);
  return key;

  // Old version using strings:
  // return `${coord.x}/${coord.y}`;
}

export function keyToCoord(key: number): WorldCoord {
  const x = key >> 16;
  const y = (key << 16) >> 16;
  return { x, y };

  // Old version using strings:
  // const fragments = key.split("/");
  // return { x: Number(fragments[0]), y: Number(fragments[1]) };
}

export class CoordMap<T> {
  map: Map<number, T>;
  defaultValue?: T;

  constructor(props?: { defaultValue?: T }) {
    this.map = new Map<number, T>();
    this.defaultValue = props?.defaultValue;
  }

  static from<T>(coordMapLike: { map: Map<number, T>; defaultValue?: T }): CoordMap<T> {
    const coordMap = new CoordMap<T>();
    coordMap.map = coordMapLike.map;
    coordMap.defaultValue = coordMapLike.defaultValue;
    return coordMap;
  }

  set(coord: WorldCoord, value: T) {
    if (
      coord.x > MAX_SUPPORTED ||
      coord.x < -1 * MAX_SUPPORTED ||
      coord.y > MAX_SUPPORTED ||
      coord.y < -1 * MAX_SUPPORTED
    ) {
      throw new Error(`CoordMap only supports coords up to ${MAX_SUPPORTED}`);
    }
    return this.map.set(coordToKey(coord), value);
  }

  get(coord: WorldCoord) {
    return this.map.get(coordToKey(coord)) ?? this.defaultValue;
  }

  keys() {
    return this.map.keys();
  }

  coords(): IterableIterator<WorldCoord> {
    return transformIterator(this.map.keys(), (key) => keyToCoord(key));
  }

  entries() {
    return this.map.entries();
  }

  toArray(): [WorldCoord, T][] {
    const entries = Array.from(this.map.entries());
    return entries.map(([key, value]) => [keyToCoord(key), value]);
  }

  values() {
    return this.map.values();
  }

  delete(coord: WorldCoord) {
    return this.map.delete(coordToKey(coord));
  }

  has(coord: WorldCoord): boolean {
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
