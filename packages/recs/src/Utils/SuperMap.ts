import { makeAutoObservable } from "mobx";
import { makeIterable, transformIterator } from "@mudkit/utils";

export class SuperMap<K, V> implements Map<K, V> {
  parent?: SuperMap<K, V>;
  child: Map<K, V>;
  private overrides: Set<K>;

  constructor(options?: { parent?: SuperMap<K, V> }) {
    this.child = new Map<K, V>();
    this.parent = options?.parent;
    this.overrides = new Set<K>();

    makeAutoObservable(this);
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return "SuperMap";
  }

  get size(): number {
    return this.child.size + (this.parent?.size || 0) - this.overrides.size;
  }

  clear(): void {
    this.child.clear();
    this.overrides.clear();
  }

  delete(key: K): boolean {
    this.overrides.delete(key);
    return this.child.delete(key);
  }

  entries(): IterableIterator<[K, V]> {
    if (!this.parent) return this.child.entries();

    const overrides = this.overrides;
    const childEntries = this.child.entries();
    const parentEntries = this.parent.entries();

    return makeIterable({
      next() {
        let next = childEntries.next();
        if (!next.done) return next;
        do {
          // Skip overrides in parent
          next = parentEntries.next();
        } while (!next.done && overrides.has(next.value[0]));
        return next;
      },
    });
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {
    this.child.forEach(callbackfn, thisArg);
    this.parent?.forEach((value: V, key: K, map: Map<K, V>) => {
      if (this.overrides.has(key)) return;
      callbackfn(value, key, map);
    }, thisArg);
  }

  get(key: K): V | undefined {
    return this.child.has(key) ? this.child.get(key) : this.parent?.get(key);
  }

  has(key: K): boolean {
    return this.parent?.has(key) || this.child.has(key);
  }

  keys(): IterableIterator<K> {
    return transformIterator(this.entries(), (entry) => entry && entry[0]);
  }

  set(key: K, value: V): this {
    if (this.parent?.has(key)) this.overrides.add(key);
    this.child.set(key, value);
    return this;
  }

  values(): IterableIterator<V> {
    return transformIterator(this.entries(), (entry) => entry && entry[1]);
  }
}
